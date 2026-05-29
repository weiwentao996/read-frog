import type { CustomActionExecutionContext, CustomActionExecutionRequest } from "@read-frog/core/custom-actions"
import type { RefObject } from "react"
import type { SelectionToolbarCustomActionRequestSlice } from "../atoms"
import type { SelectionToolbarInlineError } from "../inline-error"
import type { AnalyticsSurface } from "@/types/analytics"
import type { BackgroundStructuredObjectStreamSnapshot, ThinkingSnapshot } from "@/types/background-stream"
import type { CachedWebPageContext } from "@/utils/host/translate/webpage-context"
import { buildCustomActionExecutionRequest } from "@read-frog/core/custom-actions"
import { LANG_CODE_TO_EN_NAME } from "@read-frog/definitions"
import { useCallback, useEffect, useRef, useState } from "react"
import { ANALYTICS_FEATURE } from "@/types/analytics"
import { isLLMProviderConfig } from "@/types/config/provider"
import { createFeatureUsageContext, trackFeatureUsed } from "@/utils/analytics"
import { streamBackgroundStructuredObject } from "@/utils/content-script/background-stream-client"
import { getOrCreateWebPageContext } from "@/utils/host/translate/webpage-context"
import { truncateContextTextForCustomAction } from "../../utils"
import {
  createSelectionToolbarPrecheckError,
  createSelectionToolbarRuntimeError,
  isAbortError,
} from "../inline-error"

interface CustomActionExecutionPlan {
  error: SelectionToolbarInlineError | null
  executionContext: CustomActionExecutionContext | null
}

interface ResolvedWebPageContext {
  popoverSessionKey: number
  value: CachedWebPageContext | null
}

function scrollSelectionPopoverBodyToBottom(ref: RefObject<HTMLDivElement | null>) {
  requestAnimationFrame(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight
    }
  })
}

export function buildCustomActionExecutionPlan(
  customActionRequest: SelectionToolbarCustomActionRequestSlice,
  cleanSelection: string,
  contextText: string,
  webPageContext?: CachedWebPageContext | null,
): CustomActionExecutionPlan {
  const action = customActionRequest.action

  if (!action) {
    return {
      error: createSelectionToolbarPrecheckError("customAction", "actionUnavailable"),
      executionContext: null,
    }
  }

  if (!cleanSelection) {
    return {
      error: createSelectionToolbarPrecheckError("customAction", "missingSelection"),
      executionContext: null,
    }
  }

  const providerConfig = customActionRequest.providerConfig
  if (!providerConfig || !isLLMProviderConfig(providerConfig)) {
    return {
      error: createSelectionToolbarPrecheckError("customAction", "providerUnavailable"),
      executionContext: null,
    }
  }

  if (!providerConfig.enabled) {
    return {
      error: createSelectionToolbarPrecheckError("customAction", "providerDisabled"),
      executionContext: null,
    }
  }

  if (webPageContext === undefined) {
    return {
      error: null,
      executionContext: null,
    }
  }

  return {
    error: null,
    executionContext: {
      action,
      providerConfig,
      promptTokens: {
        selection: cleanSelection,
        paragraphs: truncateContextTextForCustomAction(contextText || cleanSelection),
        targetLanguage: LANG_CODE_TO_EN_NAME[customActionRequest.language.targetCode],
        webTitle: webPageContext?.webTitle ?? document.title,
        webContent: webPageContext?.webContent || "",
      },
    },
  }
}

export function useCustomActionWebPageContext(open: boolean, popoverSessionKey: number) {
  const [resolvedWebPageContext, setResolvedWebPageContext] = useState<ResolvedWebPageContext | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    let isCancelled = false

    void getOrCreateWebPageContext()
      .then((nextContext) => {
        if (!isCancelled) {
          setResolvedWebPageContext({
            popoverSessionKey,
            value: nextContext,
          })
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setResolvedWebPageContext({
            popoverSessionKey,
            value: null,
          })
        }
      })

    return () => {
      isCancelled = true
    }
  }, [open, popoverSessionKey])

  if (!open || resolvedWebPageContext?.popoverSessionKey !== popoverSessionKey) {
    return undefined
  }

  return resolvedWebPageContext.value
}

export function useCustomActionExecution({
  analyticsSurface,
  bodyRef,
  executionContext,
  open,
  popoverSessionKey,
  rerunNonce,
}: {
  analyticsSurface: AnalyticsSurface
  bodyRef: RefObject<HTMLDivElement | null>
  executionContext: CustomActionExecutionContext | null
  open: boolean
  popoverSessionKey: number
  rerunNonce: number
}) {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<SelectionToolbarInlineError | null>(null)
  const [thinking, setThinking] = useState<ThinkingSnapshot | null>(null)
  const lastRunKeyRef = useRef<string | null>(null)
  const bodyRefRef = useRef(bodyRef)
  bodyRefRef.current = bodyRef
  const executionRequest = executionContext
    ? buildCustomActionExecutionRequest({
        analyticsSurface,
        executionContext,
        popoverSessionKey,
        rerunNonce,
      })
    : null
  const executionRequestRef = useRef<CustomActionExecutionRequest<AnalyticsSurface> | null>(null)
  executionRequestRef.current = executionRequest
  const executionRequestKey = executionRequest?.key ?? null

  const resetSessionState = useCallback(() => {
    setIsRunning(false)
    setResult(null)
    setError(null)
    setThinking(null)
  }, [])

  useEffect(() => {
    if (!open || !executionRequestKey) {
      return
    }

    const request = executionRequestRef.current
    if (!request || request.key !== executionRequestKey) {
      return
    }

    if (lastRunKeyRef.current === executionRequestKey) {
      return
    }
    lastRunKeyRef.current = executionRequestKey

    let isCancelled = false
    const abortController = new AbortController()

    const analyticsContext = createFeatureUsageContext(
      ANALYTICS_FEATURE.CUSTOM_AI_ACTION,
      request.analytics.surface,
      Date.now(),
      {
        action_id: request.analytics.actionId,
        action_name: request.analytics.actionName,
      },
    )

    const run = async () => {
      setIsRunning(true)
      setResult(null)
      setError(null)
      setThinking({
        status: "thinking",
        text: "",
      })

      try {
        const finalResult = await streamBackgroundStructuredObject(
          request.payload,
          {
            signal: abortController.signal,
            onChunk: (partial: BackgroundStructuredObjectStreamSnapshot) => {
              if (isCancelled) {
                return
              }

              setResult(partial.output)
              setThinking(partial.thinking)
              scrollSelectionPopoverBodyToBottom(bodyRefRef.current)
            },
          },
        )

        if (isCancelled) {
          return
        }

        setResult(finalResult.output)
        setThinking(finalResult.thinking)
        void trackFeatureUsed({
          ...analyticsContext,
          outcome: "success",
        })
      }
      catch (error) {
        if (isAbortError(error)) {
          return
        }

        if (isCancelled) {
          return
        }

        setThinking(prev => prev?.text ? { ...prev, status: "complete" } : null)
        setError(createSelectionToolbarRuntimeError("customAction", error))
        void trackFeatureUsed({
          ...analyticsContext,
          outcome: "failure",
        })
      }
      finally {
        if (!isCancelled) {
          setIsRunning(false)
        }
      }
    }

    void run()

    return () => {
      isCancelled = true
      abortController.abort()
    }
  }, [executionRequestKey, open])

  useEffect(() => {
    if (!open) {
      lastRunKeyRef.current = null
    }
  }, [open])

  return {
    error,
    isRunning,
    resetSessionState,
    result,
    thinking,
  }
}

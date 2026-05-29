import type { StreamRuntimeOptions, StreamSnapshot, ThinkingSnapshot } from "./types"
import { streamText } from "ai"

function createStreamSnapshot<TOutput>(
  output: TOutput,
  thinking: ThinkingSnapshot,
): StreamSnapshot<TOutput> {
  return {
    output: output !== null && typeof output === "object"
      ? { ...output } as TOutput
      : output,
    thinking: { ...thinking },
  }
}

export async function streamCoreText(
  payload: Parameters<typeof streamText>[0],
  options: StreamRuntimeOptions<StreamSnapshot<string>> = {},
): Promise<StreamSnapshot<string>> {
  const { signal, onChunk, onError } = options

  if (signal?.aborted) {
    throw new DOMException("stream aborted", "AbortError")
  }

  let cumulativeText = ""
  let thinking: ThinkingSnapshot = {
    status: "thinking",
    text: "",
  }

  const result = streamText({
    ...payload,
    abortSignal: signal,
    onError: ({ error }) => {
      onError?.(error)
    },
  } as Parameters<typeof streamText>[0])

  for await (const part of result.fullStream) {
    if (signal?.aborted) {
      throw new DOMException("stream aborted", "AbortError")
    }

    switch (part.type) {
      case "text-delta": {
        cumulativeText += part.text
        onChunk?.(createStreamSnapshot(cumulativeText, thinking))
        break
      }
      case "reasoning-delta": {
        thinking = {
          status: "thinking",
          text: thinking.text + part.text,
        }
        onChunk?.(createStreamSnapshot(cumulativeText, thinking))
        break
      }
      case "reasoning-end": {
        thinking = {
          ...thinking,
          status: "complete",
        }
        onChunk?.(createStreamSnapshot(cumulativeText, thinking))
        break
      }
      case "error": {
        throw part.error
      }
    }
  }

  thinking = {
    ...thinking,
    status: "complete",
  }

  return createStreamSnapshot(cumulativeText, thinking)
}

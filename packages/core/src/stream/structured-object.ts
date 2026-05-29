import type { StreamRuntimeOptions, StreamSnapshot, ThinkingSnapshot } from "./types"
import { Output, parsePartialJson, streamText } from "ai"
import { z } from "zod"

export interface StructuredObjectField {
  name: string
  type: "string" | "number"
}

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

export function createStructuredObjectSchema(outputSchema: StructuredObjectField[]) {
  const nameSet = new Set<string>()
  for (const field of outputSchema) {
    if (nameSet.has(field.name)) {
      throw new Error(`Duplicate output schema name "${field.name}".`)
    }
    nameSet.add(field.name)
  }

  const fieldTypeToZodSchema: Record<string, z.ZodTypeAny> = {
    string: z.string().nullable(),
    number: z.number().nullable(),
  }

  const schemaShape: Record<string, z.ZodTypeAny> = {}
  for (const field of outputSchema) {
    schemaShape[field.name] = fieldTypeToZodSchema[field.type] ?? z.string().nullable()
  }

  return z.object(schemaShape).strict()
}

export async function streamCoreStructuredObject(
  payload: Parameters<typeof streamText>[0] & { outputSchema: StructuredObjectField[] },
  options: StreamRuntimeOptions<StreamSnapshot<Record<string, unknown>>> = {},
): Promise<StreamSnapshot<Record<string, unknown>>> {
  const { outputSchema, ...streamParams } = payload
  const { signal, onChunk, onError } = options

  if (signal?.aborted) {
    throw new DOMException("stream aborted", "AbortError")
  }

  const objectSchema = createStructuredObjectSchema(outputSchema)
  let cumulativeValue: Record<string, unknown> = {}
  let thinking: ThinkingSnapshot = {
    status: "thinking",
    text: "",
  }

  const result = streamText({
    ...streamParams,
    output: Output.object({
      schema: objectSchema,
    }),
    abortSignal: signal,
    onError: ({ error }) => {
      onError?.(error)
    },
  } as Parameters<typeof streamText>[0])
  let cumulativeText = ""

  for await (const part of result.fullStream) {
    if (signal?.aborted) {
      throw new DOMException("stream aborted", "AbortError")
    }

    switch (part.type) {
      case "text-delta": {
        cumulativeText += part.text
        const partial = await parsePartialJson(cumulativeText)
        if (isRecord(partial.value)) {
          cumulativeValue = { ...cumulativeValue, ...partial.value }
          onChunk?.(createStreamSnapshot(cumulativeValue, thinking))
        }
        break
      }
      case "reasoning-delta": {
        thinking = {
          status: "thinking",
          text: thinking.text + part.text,
        }
        onChunk?.(createStreamSnapshot(cumulativeValue, thinking))
        break
      }
      case "reasoning-end": {
        thinking = {
          ...thinking,
          status: "complete",
        }
        onChunk?.(createStreamSnapshot(cumulativeValue, thinking))
        break
      }
      case "error": {
        throw part.error
      }
    }
  }

  const finalJson = await parsePartialJson(cumulativeText)
  const finalValue = objectSchema.parse(finalJson.value)

  thinking = {
    ...thinking,
    status: "complete",
  }

  return createStreamSnapshot(finalValue, thinking)
}

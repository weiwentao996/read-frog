export interface ThinkingSnapshot {
  status: "thinking" | "complete"
  text: string
}

export interface StreamSnapshot<TOutput> {
  output: TOutput
  thinking: ThinkingSnapshot
}

export interface StreamRuntimeOptions<TResponse> {
  signal?: AbortSignal
  onChunk?: (snapshot: TResponse) => void
  onError?: (error: unknown) => void
}

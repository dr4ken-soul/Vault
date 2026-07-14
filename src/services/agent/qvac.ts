/**
 * QVAC integration boundary.
 *
 * @qvac/sdk runs local inference on Node, Bare, and Expo. It is not a pure
 * browser package today, so Vault evaluates squads with the on-device engine in
 * evaluate.ts for the web demo path. This adapter loads QVAC only when present
 * at runtime, without bundling it into the browser build.
 *
 * The agent decision loop never calls a cloud LLM endpoint.
 */

export interface QvacCompletionRequest {
  system: string
  prompt: string
}

export interface QvacAdapter {
  available: boolean
  complete: (request: QvacCompletionRequest) => Promise<string>
}

let cached: QvacAdapter | null = null

async function tryLoadQvacModule(): Promise<Record<string, unknown> | null> {
  try {
    // Vite must not resolve this at build time. Runtime hosts that install
    // @qvac/sdk (Node/Bare) can still wire it through this boundary.
    const specifier = ['@qvac', 'sdk'].join('/')
    const dynamicImport = new Function('s', 'return import(s)') as (
      s: string,
    ) => Promise<Record<string, unknown>>
    return await dynamicImport(specifier)
  } catch {
    return null
  }
}

export async function getQvacAdapter(): Promise<QvacAdapter> {
  if (cached) return cached

  const qvac = await tryLoadQvacModule()
  if (!qvac) {
    cached = {
      available: false,
      async complete() {
        throw new Error('QVAC SDK is not available in this runtime.')
      },
    }
    return cached
  }

  cached = {
    available: true,
    async complete(request) {
      const loadModel = qvac.loadModel as (model: unknown) => Promise<unknown>
      const unloadModel = qvac.unloadModel as (model: unknown) => Promise<void>
      const completion = qvac.completion as (opts: unknown) => Promise<unknown>
      const modelId = qvac.LLAMA_3_2_1B_INST_Q4_0
      const model = await loadModel(modelId)
      try {
        const result = await completion({
          model,
          messages: [
            { role: 'system', content: request.system },
            { role: 'user', content: request.prompt },
          ],
        })
        if (typeof result === 'string') return result
        if (result && typeof result === 'object' && 'text' in result) {
          return String((result as { text: unknown }).text ?? '')
        }
        return String(result ?? '')
      } finally {
        await unloadModel(model)
      }
    },
  }
  return cached
}

export async function enrichReasoningWithQvac(
  baseReasoning: string,
  context: string,
): Promise<{ text: string; engine: 'qvac' | 'local' }> {
  const adapter = await getQvacAdapter()
  if (!adapter.available) {
    return { text: baseReasoning, engine: 'local' }
  }

  try {
    const text = await adapter.complete({
      system:
        'You are Vault, an on-device fantasy football agent. Write formal British English. No em dashes. Be concise.',
      prompt: `Context:\n${context}\n\nBase evaluation:\n${baseReasoning}\n\nRewrite as a single formal agent log paragraph.`,
    })
    return { text: text.trim() || baseReasoning, engine: 'qvac' }
  } catch {
    return { text: baseReasoning, engine: 'local' }
  }
}

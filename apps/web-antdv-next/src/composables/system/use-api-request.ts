import { ref } from 'vue';

export interface UseApiRequestOptions {
  immediate?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}

export function useApiRequest<TData, TArgs extends unknown[] = []>(
  requestFn: (...args: TArgs) => Promise<TData>,
  options: UseApiRequestOptions = {},
) {
  const data = ref<TData | null>(null);
  const loading = ref(false);
  const error = ref<unknown>(null);

  async function execute(...args: TArgs): Promise<TData | null> {
    loading.value = true;
    error.value = null;

    try {
      const result = await requestFn(...args);
      data.value = result;

      options.onSuccess?.(result);

      return result;
    } catch (err) {
      error.value = err;
      options.onError?.(err);

      return null;
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    data.value = null;
    error.value = null;
    loading.value = false;
  }

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

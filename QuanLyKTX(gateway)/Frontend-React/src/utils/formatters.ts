// Utility Formatters

export function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString as string);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('vi-VN');
  } catch {
    return 'N/A';
  }
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
}

export function formatCurrency(amount: number | undefined | null | string): string {
  if (amount === undefined || amount === null || amount === '') return '0 đ';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0 đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatNumber(num: number | undefined | null | string): string {
  if (num === undefined || num === null || num === '') return '0';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  return new Intl.NumberFormat('vi-VN').format(n);
}

export function formatVietnameseDate(): string {
  return new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function parseResponse<T>(data: unknown): T {
  if (!data) return [] as unknown as T;

  const response = data as Record<string, unknown>;

  // Case 1: { success: true, data: [...] }
  if ('data' in response && response.data !== undefined) {
    if (Array.isArray(response.data)) {
      return response.data as unknown as T;
    }
    // Case 2: { success: true, data: { data: [...] } }
    const nested = response.data as Record<string, unknown>;
    if ('data' in nested && Array.isArray(nested.data)) {
      return nested.data as unknown as T;
    }
    // Case 3: { success: true, data: {...} } → single object
    return response.data as unknown as T;
  }

  // Case 4: Direct array
  if (Array.isArray(data)) {
    return data as unknown as T;
  }

  // Case 5: Single object
  return data as unknown as T;
}

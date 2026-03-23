// Enhanced DataTable — search, filter, pagination
import React, { useState, useMemo } from 'react';

interface Column<T> {
  key: string;
  label: string;
  // First param = column VALUE; Second param = full ITEM
  // Old pattern "render: (item) => item.foo" is WRONG — use "render: (_, item) => item.foo"
  render?: (value: unknown, item?: T) => React.ReactNode;
  className?: string;
  filterable?: boolean; // include in text search
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  noData?: React.ReactNode;
  /** Initial page size. Default 10 */
  pageSize?: number;
  /** Show global search bar */
  searchable?: boolean;
  /** Column keys to search across (defaults to all string/number columns) */
  searchKeys?: string[];
  /** Custom row class */
  rowClassName?: (item: T) => string;
  /** Hidden columns */
  hiddenColumns?: string[];
  /** Legacy row actions renderer */
  actions?: (item: T) => React.ReactNode;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  emptyMessage = 'Không có dữ liệu',
  onRowClick,
  noData,
  pageSize: initialPageSize = 10,
  searchable = false,
  searchKeys,
  rowClassName,
  hiddenColumns = [],
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filtered data
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    const keys = searchKeys ?? columns.filter((c) => !hiddenColumns.includes(c.key)).map((c) => c.key);
    return data.filter((item) =>
      keys.some((k) => {
        const v = item[k];
        return v != null && String(v).toLowerCase().includes(q);
      })
    );
  }, [data, search, searchKeys, columns, hiddenColumns]);

  // Paginated
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset to page 1 when search changes
  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const visibleCols = columns.filter((c) => !hiddenColumns.includes(c.key));
  const hasActions = typeof actions === 'function';
  const colSpan = visibleCols.length + (hasActions ? 1 : 0);

  if (loading) {
    return (
      <div className="table-loading text-center p-4">
        <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
        <p className="mt-2 mb-0 text-muted">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="data-table-wrapper">
      {/* Toolbar */}
      {searchable && (
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div className="input-group" style={{ maxWidth: 320 }}>
            <span className="input-group-text"><i className="fas fa-search"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button className="btn btn-outline-secondary" onClick={() => handleSearch('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          <div className="d-flex align-items-center gap-2">
            <label className="text-muted small mb-0">Hiển thị:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={pageSize}
              onChange={(e) => handlePageSize(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="text-muted small">
              {filtered.length > 0
                ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)} / ${filtered.length}`
                : `0 / ${filtered.length}`}
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {visibleCols.map((col) => (
                <th key={col.key} className={col.className}>
                  {col.label}
                </th>
              ))}
              {hasActions && <th>Hành động</th>}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="text-center text-muted p-4">
                  <i className="fas fa-inbox fa-2x d-block mb-2"></i>
                  {noData || emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((item, index) => (
                <tr
                  key={index}
                  className={rowClassName ? rowClassName(item) : undefined}
                  onClick={() => onRowClick?.(item)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {visibleCols.map((col) => (
                    <td key={col.key} className={col.className} data-label={col.label}>
                      {(() => {
                        if (!col.render) {
                          const raw = item[col.key];
                          if (raw == null) return '—';
                          if (typeof raw === 'object') return '—';
                          return String(raw);
                        }

                        const value = item[col.key];

                        // Robust render strategy for both signatures:
                        // - modern: render(value, item)
                        // - legacy: render(item)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const fn = col.render as any;

                        const isInvalidPlainObject = (x: unknown) =>
                          x !== null && typeof x === 'object' && !Array.isArray(x) && !React.isValidElement(x);

                        let out: React.ReactNode;
                        try {
                          if (fn.length >= 2) {
                            // modern signature: (value, item)
                            out = fn(value, item);
                          } else {
                            // single-arg signature:
                            // - if value exists => likely (value)
                            // - if value missing => likely legacy (item)
                            out = value === undefined ? fn(item) : fn(value);
                          }

                          // If call returns plain object, try legacy item fallback
                          if (isInvalidPlainObject(out)) {
                            out = fn(item);
                          }
                        } catch {
                          try {
                            out = fn(item);
                          } catch {
                            return '—';
                          }
                        }

                        if (isInvalidPlainObject(out)) {
                          return '—';
                        }
                        return out;
                      })()}
                    </td>
                  ))}
                  {hasActions && (
                    <td data-label="Hành động">{actions?.(item)}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(1)}><i className="fas fa-angle-double-left"></i></button>
              </li>
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}><i className="fas fa-chevron-left"></i></button>
              </li>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(pageNum)}>{pageNum}</button>
                  </li>
                );
              })}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}><i className="fas fa-chevron-right"></i></button>
              </li>
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(totalPages)}><i className="fas fa-angle-double-right"></i></button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

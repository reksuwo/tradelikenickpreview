"use client";

import { useState, type ReactNode } from "react";
import { TABLE, TableWrap } from "./admin-ui";

export const ROWS_PER_PAGE = 10;

/** Which slice to show. Clamps when the rows change, e.g. after a search or a delete. */
function usePage(count: number, pageSize: number) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(count / pageSize));
  const current = Math.min(page, pages);
  return { page: current, pages, setPage, start: (current - 1) * pageSize };
}

function Pager({
  page,
  pages,
  count,
  pageSize,
  onPage,
}: {
  page: number;
  pages: number;
  count: number;
  pageSize: number;
  onPage: (page: number) => void;
}) {
  if (count <= pageSize) return null;
  const button =
    "rounded-full px-4 py-2 text-[13.5px] font-semibold ring-1 ring-white/15 transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30";
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 text-[13.5px] text-white/55 sm:px-6">
      <span className="tabnum">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, count)} of {count.toLocaleString()}
      </span>
      <span className="flex gap-2">
        <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className={button}>
          ← Previous
        </button>
        <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} className={button}>
          Next →
        </button>
      </span>
    </div>
  );
}

/** A table that shows ten rows at a time. Rows are rendered on the server and passed in. */
export function PagedTable({
  head,
  rows,
  empty,
  pageSize = ROWS_PER_PAGE,
}: {
  /** The <tr> for the header. */
  head: ReactNode;
  /** One <tr> per row. */
  rows: ReactNode[];
  empty?: ReactNode;
  pageSize?: number;
}) {
  const { page, pages, setPage, start } = usePage(rows.length, pageSize);
  if (!rows.length && empty) return <>{empty}</>;

  return (
    <>
      <TableWrap>
        <table className={TABLE}>
          <thead>{head}</thead>
          <tbody className="tabnum">{rows.slice(start, start + pageSize)}</tbody>
        </table>
      </TableWrap>
      <Pager page={page} pages={pages} count={rows.length} pageSize={pageSize} onPage={setPage} />
    </>
  );
}

/** A list that shows ten items at a time. Each item is an <li>. */
export function PagedList({
  items,
  empty,
  pageSize = ROWS_PER_PAGE,
  className = "",
  ordered = false,
}: {
  items: ReactNode[];
  empty?: ReactNode;
  pageSize?: number;
  className?: string;
  /** Render an <ol>, for lists whose order means something. */
  ordered?: boolean;
}) {
  const { page, pages, setPage, start } = usePage(items.length, pageSize);
  if (!items.length && empty) return <>{empty}</>;

  return (
    <>
      {ordered ? (
        <ol className={className}>{items.slice(start, start + pageSize)}</ol>
      ) : (
        <ul className={className}>{items.slice(start, start + pageSize)}</ul>
      )}
      <Pager page={page} pages={pages} count={items.length} pageSize={pageSize} onPage={setPage} />
    </>
  );
}

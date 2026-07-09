import { useEffect, useRef } from 'react';
import MahnstufeBadge from './MahnstufeBadge.jsx';

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

function SortableTh({ label, sortKey, activeKey, dir, onSort }) {
  const isActive = activeKey === sortKey;
  const cls = `th-sortable${isActive ? ` th-sortable--${dir}` : ''}`;
  return (
    <th className={cls} onClick={() => onSort(sortKey)}>{label}</th>
  );
}

export default function InvoiceTable({
  invoices, activeTab, onRowClick,
  sortKey, sortDir, onSort,
  selectable = false, selectedIds, onToggleSelect, onToggleSelectAll,
}) {
  const isBezahltTab = activeTab === 'bezahlt';
  const headerCheckboxRef = useRef(null);

  const allSelected = selectable && invoices.length > 0 && invoices.every(inv => selectedIds.has(inv.id));
  const someSelected = selectable && invoices.some(inv => selectedIds.has(inv.id));

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  const colCount = (selectable ? 1 : 0) + 6;

  return (
    <div className="invoice-table-wrapper">
      <table className="invoice-table">
        <thead>
          <tr>
            {selectable && (
              <th className="checkbox-cell">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                />
              </th>
            )}
            <th>Rechnungs-Nr.</th>
            <th>Kunde</th>
            <SortableTh label="Betrag" sortKey="betrag" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortableTh label="Fällig am" sortKey="faelligkeitsdatum" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            {isBezahltTab ? (
              <th>Bezahlt am</th>
            ) : (
              <SortableTh label="Verzug" sortKey="overdueDays" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            )}
            <th>{isBezahltTab ? 'Status' : 'Mahnstufe'}</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="invoice-table__empty">
                Keine Rechnungen in dieser Ansicht.
              </td>
            </tr>
          ) : (
            invoices.map((inv) => (
              <tr
                key={inv.id}
                className={`row-clickable${selectable && selectedIds.has(inv.id) ? ' row-selected' : ''}`}
                onClick={() => onRowClick(inv)}
              >
                {selectable && (
                  <td className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(inv.id)}
                      onChange={() => onToggleSelect(inv.id)}
                    />
                  </td>
                )}
                <td>{inv.rechnungsnummer}</td>
                <td>
                  <div className="cell-customer__name">{inv.kunden?.firmenname}</div>
                  <div className="cell-customer__contact">{inv.kunden?.ansprechpartner_name}</div>
                </td>
                <td>{currencyFormatter.format(inv.betrag)}</td>
                <td>{new Date(inv.faelligkeitsdatum).toLocaleDateString('de-DE')}</td>
                <td>
                  {isBezahltTab ? (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                      {inv.bezahlt_am ? new Date(inv.bezahlt_am).toLocaleDateString('de-DE') : '—'}
                    </span>
                  ) : (
                    <span className={inv.overdueDays > 0 ? 'cell-overdue' : 'cell-overdue--none'}>
                      {inv.overdueDays} Tage
                    </span>
                  )}
                </td>
                <td>
                  {isBezahltTab ? (
                    <span className="badge badge--success">Bezahlt</span>
                  ) : (
                    <MahnstufeBadge stufe={inv.mahnstufe} />
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

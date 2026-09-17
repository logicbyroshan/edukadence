import React from 'react';

export const Table = ({
  children,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        {children}
      </table>
    </div>
  );
};

export const TableHead = ({ children, className = '' }) => (
  <thead className={`bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider ${className}`}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-slate-100 ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, hover = true, className = '', onClick }) => (
  <tr
    onClick={onClick}
    className={`
      ${hover ? 'hover:bg-slate-50/60 transition-colors' : ''}
      ${onClick ? 'cursor-pointer' : ''}
      ${className}
    `}
  >
    {children}
  </tr>
);

export const TableHeaderCell = ({ children, className = '' }) => (
  <th className={`p-3.5 px-4 font-semibold ${className}`}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`p-3.5 px-4 text-xs text-slate-700 align-middle ${className}`}>
    {children}
  </td>
);

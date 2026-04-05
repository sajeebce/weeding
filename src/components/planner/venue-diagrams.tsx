// Shared SVG diagrams used on ceremony/reception pages and the seating page

export function CeremonyDiagram() {
  const cx = 230;
  const sR = 11;
  const aisleHalf = 37;
  const sp = 24;

  const leftXs  = Array.from({ length: 5 }, (_, i) => cx - aisleHalf - sR - (4 - i) * sp);
  const rightXs = Array.from({ length: 5 }, (_, i) => cx + aisleHalf + sR + i * sp);

  const rowStartY = 230;
  const rowSpacing = 42;
  const numRows = 8;
  const rows = Array.from({ length: numRows }, (_, i) => rowStartY + i * rowSpacing);
  const aisleTextY = rowStartY + Math.floor(numRows / 2) * rowSpacing - 6;

  const pewLeft0 = leftXs[0] - sR - 5;
  const pewLeft1 = leftXs[4] + sR;
  const pewRight0 = rightXs[0] - sR;
  const pewRight1 = rightXs[4] + sR + 5;

  const arcRows = [
    { y: 152, lx: [152, 172],           rx: [288, 308] },
    { y: 184, lx: [128, 152, 172],      rx: [288, 308, 332] },
  ];

  return (
    <svg viewBox="0 0 460 565" className="w-full h-auto">
      <rect width="460" height="565" fill="white" />
      <path d="M 195 120 L 195 72 A 35 40 0 0 1 265 72 L 265 120"
        fill="none" stroke="#aaa" strokeWidth="2.5" />
      <path d="M 208 120 L 208 84 A 22 28 0 0 1 252 84 L 252 120"
        fill="none" stroke="#aaa" strokeWidth="2" />
      {[98, 111].map(y => (
        <g key={y}>
          <line x1="195" y1={y} x2="208" y2={y} stroke="#ccc" strokeWidth="1.5" />
          <line x1="252" y1={y} x2="265" y2={y} stroke="#ccc" strokeWidth="1.5" />
        </g>
      ))}
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fdf4ec" stopOpacity="0.7" />
          <stop offset="50%"  stopColor="#fdf4ec" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fdf4ec" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect x={cx - aisleHalf} y={120} width={aisleHalf * 2} height={rows[numRows - 1] - 120 + 24} fill="url(#ag)" />
      <text x={cx} y={aisleTextY} textAnchor="middle" fontSize="10" fill="#bbb" fontFamily="serif" fontStyle="italic">
        The aisle
      </text>
      {arcRows.map((row, ri) => (
        <g key={`arc-${ri}`}>
          <line x1={row.lx[0] - sR} y1={row.y} x2={row.lx[row.lx.length - 1] + sR} y2={row.y} stroke="#e5e7eb" strokeWidth="1" />
          <line x1={row.rx[0] - sR} y1={row.y} x2={row.rx[row.rx.length - 1] + sR} y2={row.y} stroke="#e5e7eb" strokeWidth="1" />
          {row.lx.map((x, si) => (
            <g key={`arcl-${ri}-${si}`}>
              <circle cx={x} cy={row.y} r={sR} fill="white" stroke="#ccc" strokeWidth="1.2" />
              <text x={x} y={row.y + 4} textAnchor="middle" fontSize="9" fill="#aaa">{si + 1}</text>
            </g>
          ))}
          {row.rx.map((x, si) => (
            <g key={`arcr-${ri}-${si}`}>
              <circle cx={x} cy={row.y} r={sR} fill="white" stroke="#ccc" strokeWidth="1.2" />
              <text x={x} y={row.y + 4} textAnchor="middle" fontSize="9" fill="#aaa">{si + 1}</text>
            </g>
          ))}
        </g>
      ))}
      {rows.map((y, ri) => (
        <g key={`row-${ri}`}>
          <line x1={pewLeft0} y1={y} x2={pewLeft1} y2={y} stroke="#e5e7eb" strokeWidth="1" />
          <line x1={pewRight0} y1={y} x2={pewRight1} y2={y} stroke="#e5e7eb" strokeWidth="1" />
          {leftXs.map((x, si) => (
            <g key={`l-${ri}-${si}`}>
              <circle cx={x} cy={y} r={sR} fill="white" stroke="#ccc" strokeWidth="1.2" />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fill="#aaa">{5 - si}</text>
            </g>
          ))}
          {rightXs.map((x, si) => (
            <g key={`r-${ri}-${si}`}>
              <circle cx={x} cy={y} r={sR} fill="white" stroke="#ccc" strokeWidth="1.2" />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fill="#aaa">{si + 1}</text>
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

export function ReceptionDiagram() {
  const tables = [
    { cx: 115, cy: 115, r: 38, seats: 8, label: "1" },
    { cx: 230, cy: 115, r: 38, seats: 8, label: "2" },
    { cx: 345, cy: 115, r: 38, seats: 8, label: "3" },
    { cx: 115, cy: 240, r: 38, seats: 8, label: "4" },
    { cx: 230, cy: 240, r: 38, seats: 8, label: "5" },
    { cx: 345, cy: 240, r: 38, seats: 8, label: "6" },
    { cx: 115, cy: 365, r: 38, seats: 8, label: "7" },
    { cx: 230, cy: 365, r: 38, seats: 8, label: "8" },
    { cx: 345, cy: 365, r: 38, seats: 8, label: "9" },
  ];
  const sR = 10;
  return (
    <svg viewBox="0 0 460 480" className="w-full h-auto">
      <rect width="460" height="480" fill="white" />
      <rect x={155} y={170} width={150} height={100} rx="10"
        fill="#fdf4ec" stroke="#e9d8c8" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x={230} y={225} textAnchor="middle" fontSize="10" fill="#c4a98a" fontFamily="serif" fontStyle="italic">
        Dance Floor
      </text>
      {tables.map((t) => {
        const angleStep = (2 * Math.PI) / t.seats;
        const seatR = t.r + sR + 4;
        return (
          <g key={t.label}>
            <circle cx={t.cx} cy={t.cy} r={t.r} fill="white" stroke="#ccc" strokeWidth="1.5" />
            <text x={t.cx} y={t.cy + 4} textAnchor="middle" fontSize="11" fill="#bbb" fontWeight="500">
              {t.label}
            </text>
            {Array.from({ length: t.seats }, (_, si) => {
              const angle = si * angleStep - Math.PI / 2;
              const sx = t.cx + Math.cos(angle) * seatR;
              const sy = t.cy + Math.sin(angle) * seatR;
              return <circle key={si} cx={sx} cy={sy} r={sR} fill="white" stroke="#ccc" strokeWidth="1.2" />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

"use client";

import { forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Group, Rect, Circle, Ellipse, Text, Arc, Line } from "react-konva";
import type Konva from "konva";

// ─── Types (kept minimal — only what this component needs) ───────────────────

type TableType = "ROUND" | "RECTANGULAR" | "SQUARE" | "OBLONG" | "HALF_ROUND" | "CHAIRS_ROW" | "BUFFET";

interface SeatTable {
  id: string;
  name: string;
  type: TableType;
  x: number;
  y: number;
  seats: number;
  rotation: number;
  color: string;
  guestIds: string[];
}

interface Layout {
  tables: SeatTable[];
  bgColor: string;
}

interface Guest {
  id: string;
  firstName: string;
  lastName: string | null;
  side: "BRIDE" | "GROOM";
}

interface Props {
  layout: Layout;
  guests: Guest[];
  selectedTableId: string | null;
  onSelectTable: (id: string | null) => void;
  onMoveTable: (id: string, x: number, y: number) => void;
  onAssignGuests: (table: SeatTable) => void;
}

// ─── Table dimensions by type ─────────────────────────────────────────────────

function tableDims(type: TableType): { w: number; h: number } {
  switch (type) {
    case "ROUND":       return { w: 88, h: 88 };
    case "SQUARE":      return { w: 88, h: 88 };
    case "RECTANGULAR": return { w: 140, h: 70 };
    case "OBLONG":      return { w: 180, h: 72 };
    case "HALF_ROUND":  return { w: 100, h: 55 };
    case "CHAIRS_ROW":  return { w: 160, h: 40 };
    case "BUFFET":      return { w: 200, h: 48 };
  }
}

// ─── Table shape on canvas ────────────────────────────────────────────────────

function TableShape({
  table,
  guests,
  isSelected,
  onSelect,
  onDragEnd,
  onDoubleClick,
}: {
  table: SeatTable;
  guests: Guest[];
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onDoubleClick: () => void;
}) {
  const { w, h } = tableDims(table.type);
  const filled = table.guestIds.length;
  const cap = table.seats;
  const fillPct = cap > 0 ? filled / cap : 0;

  // Fill color based on occupancy
  const fillColor = isSelected
    ? "#e0e7ff"
    : fillPct >= 1
      ? "#dcfce7"
      : fillPct > 0
        ? "#fef9c3"
        : table.color || "#ffffff";

  const strokeColor = isSelected ? "#6366f1" : "#d1d5db";
  const strokeWidth = isSelected ? 2.5 : 1.5;

  // Draw dots for assigned guests (bride=rose, groom=blue)
  function guestDots() {
    if (filled === 0) return null;
    return table.guestIds.slice(0, 6).map((gid, i) => {
      const g = guests.find(x => x.id === gid);
      const color = g?.side === "BRIDE" ? "#fb7185" : "#60a5fa";
      return (
        <Circle
          key={gid}
          x={-w / 2 + 10 + i * 11}
          y={h / 2 - 12}
          radius={4}
          fill={color}
          listening={false}
        />
      );
    });
  }

  const sharedProps = {
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth,
    shadowColor: isSelected ? "#6366f1" : "#00000022",
    shadowBlur: isSelected ? 10 : 4,
    shadowOffset: { x: 0, y: 2 },
    listening: false,
  };

  function Shape() {
    switch (table.type) {
      case "ROUND":
        return <Circle radius={w / 2} {...sharedProps} />;
      case "HALF_ROUND":
        return <Arc innerRadius={0} outerRadius={w / 2} angle={180} {...sharedProps} rotation={-90} />;
      case "SQUARE":
      case "RECTANGULAR":
      case "OBLONG":
      case "BUFFET":
      case "CHAIRS_ROW":
        return (
          <Rect
            x={-w / 2} y={-h / 2}
            width={w} height={h}
            cornerRadius={table.type === "BUFFET" || table.type === "CHAIRS_ROW" ? 4 : 8}
            {...sharedProps}
          />
        );
    }
  }

  return (
    <Group
      x={table.x}
      y={table.y}
      rotation={table.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onDoubleClick}
      onDblTap={onDoubleClick}
      onDragEnd={e => onDragEnd(e.target.x(), e.target.y())}
    >
      <Shape />

      {/* Table name */}
      <Text
        text={table.name}
        fontSize={11}
        fontFamily="Inter, sans-serif"
        fontStyle="600"
        fill="#374151"
        align="center"
        width={w}
        x={-w / 2}
        y={-8}
        listening={false}
      />

      {/* Seat count */}
      {cap > 0 && (
        <Text
          text={`${filled}/${cap}`}
          fontSize={9}
          fontFamily="Inter, sans-serif"
          fill="#9ca3af"
          align="center"
          width={w}
          x={-w / 2}
          y={7}
          listening={false}
        />
      )}

      {/* Guest dots */}
      {guestDots()}
    </Group>
  );
}

// ─── Canvas component (Konva Stage) ──────────────────────────────────────────

const SeatingCanvas = forwardRef<{ downloadImage: () => void }, Props>(function SeatingCanvas(
  { layout, guests, selectedTableId, onSelectTable, onMoveTable, onAssignGuests },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Zoom on wheel
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.08;
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - offset.x) / oldScale,
      y: (pointer.y - offset.y) / oldScale,
    };
    const newScale = e.evt.deltaY < 0
      ? Math.min(oldScale * scaleBy, 3)
      : Math.max(oldScale / scaleBy, 0.3);
    setScale(newScale);
    setOffset({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }, [scale, offset]);

  // Pan on middle-mouse or space+drag
  function handleStageMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    if (e.evt.button === 1 || e.evt.altKey) {
      isPanning.current = true;
      lastPos.current = { x: e.evt.clientX, y: e.evt.clientY };
    }
  }
  function handleStageMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    if (!isPanning.current) return;
    const dx = e.evt.clientX - lastPos.current.x;
    const dy = e.evt.clientY - lastPos.current.y;
    lastPos.current = { x: e.evt.clientX, y: e.evt.clientY };
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  }
  function handleStageMouseUp() { isPanning.current = false; }

  // Click on empty stage → deselect
  function handleStageClick(e: Konva.KonvaEventObject<MouseEvent>) {
    if (e.target === stageRef.current) onSelectTable(null);
  }

  // Export PNG
  useImperativeHandle(ref, () => ({
    downloadImage() {
      if (!stageRef.current) return;
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = uri;
      a.download = "seating-chart.png";
      a.click();
    },
  }));

  return (
    <div ref={containerRef} className="h-full w-full cursor-default">
      <Stage
        ref={stageRef}
        width={size.w}
        height={size.h}
        scaleX={scale}
        scaleY={scale}
        x={offset.x}
        y={offset.y}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={handleStageClick}
        style={{ background: layout.bgColor || "#f5f5f0" }}
      >
        <Layer>
          {layout.tables.map(table => (
            <TableShape
              key={table.id}
              table={table}
              guests={guests}
              isSelected={table.id === selectedTableId}
              onSelect={() => onSelectTable(table.id)}
              onDragEnd={(x, y) => onMoveTable(table.id, x, y)}
              onDoubleClick={() => onAssignGuests(table)}
            />
          ))}
        </Layer>
      </Stage>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <button
          onClick={() => setScale(s => Math.min(s * 1.2, 3))}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow text-gray-600 hover:bg-gray-50 text-lg font-bold"
        >+</button>
        <button
          onClick={() => setScale(1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow text-xs text-gray-600 hover:bg-gray-50"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          onClick={() => setScale(s => Math.max(s / 1.2, 0.3))}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow text-gray-600 hover:bg-gray-50 text-lg font-bold"
        >−</button>
      </div>

      {/* Hint */}
      {layout.tables.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl bg-white/80 px-6 py-4 text-center shadow backdrop-blur-sm">
            <p className="text-sm font-medium text-gray-700">Canvas is empty</p>
            <p className="mt-1 text-xs text-gray-400">Click &quot;Add Table&quot; in the toolbar to place tables.</p>
            <p className="mt-1 text-xs text-gray-400">Double-click a table to assign guests. Drag to reposition.</p>
          </div>
        </div>
      )}
    </div>
  );
});

export default SeatingCanvas;

import Link from "next/link";
import type { StockQuote } from "@/lib/finance/types";
import { displaySymbol } from "@/lib/finance/transformers";
import { ChangeBadge } from "./change-badge";
import { cn } from "@/lib/utils";

interface StockTableProps {
  stocks: StockQuote[];
  compact?: boolean;
  className?: string;
}

export function StockTable({ stocks, compact = true, className }: StockTableProps) {
  if (!stocks.length) {
    return (
      <p className="text-[10px] text-muted-foreground py-4 text-center">
        No data available
      </p>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-border/40 text-left text-[9px] text-muted-foreground">
            <th className="font-medium py-1 pr-2">#</th>
            <th className="font-medium py-1 pr-2">Stock</th>
            <th className="font-medium py-1 px-1 text-right">Price</th>
            <th className="font-medium py-1 pl-1 text-right">Chg</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock, i) => (
            <tr
              key={stock.symbol}
              className="border-b border-border/20 last:border-0 hover:bg-muted/25 transition-colors"
            >
              <td className="py-1 pr-2 text-muted-foreground tabular-nums w-5">
                {i + 1}
              </td>
              <td className="py-1 pr-2">
                <Link
                  href={`/finance/stock/${displaySymbol(stock.symbol)}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {displaySymbol(stock.symbol)}
                </Link>
              </td>
              <td className="py-1 px-1 text-right font-medium tabular-nums">
                ₹{stock.price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </td>
              <td className="py-1 pl-1 text-right">
                <ChangeBadge
                  change={stock.change}
                  changePercent={stock.changePercent}
                  size="xs"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

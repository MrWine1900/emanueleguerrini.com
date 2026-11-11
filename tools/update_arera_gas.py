#!/usr/bin/env python3
"""Refresh the latest official ARERA CMEM,m gas commodity price; never guess data."""
from __future__ import annotations
import json
import re
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen

SOURCE = "https://www.arera.it/area-operatori/prezzi-e-tariffe/valore-cmemm-vulnerabili"
DEST = Path(__file__).resolve().parent.parent / "data" / "gas-price.json"
PCS = 0.03852  # GJ/Smc, ARERA reference gross calorific value
MONTHS = dict(zip(
    ("gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre").split(),
    range(1, 13),
))


class OfficialRows(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.rows: list[list[str]] = []
        self.cells: list[str] = []
        self.bits: list[str] = []
        self.in_row = False
        self.in_cell = False

    def handle_starttag(self, tag: str, attrs: list) -> None:
        if tag == "tr":
            self.in_row = True
            self.cells = []
        elif tag in {"td", "th"} and self.in_row:
            self.in_cell = True
            self.bits = []

    def handle_data(self, data: str) -> None:
        if self.in_cell:
            self.bits.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag in {"td", "th"} and self.in_cell:
            self.cells.append(" ".join(" ".join(self.bits).split()))
            self.in_cell = False
        elif tag == "tr" and self.in_row:
            if self.cells:
                self.rows.append(self.cells[:])
            self.in_row = False


def number(s: str) -> float:
    return float(s.strip().replace("\N{NO-BREAK SPACE}", "").replace(" ", "").replace(",", "."))


def main() -> int:
    request = Request(SOURCE, headers={"User-Agent": "Mozilla/5.0 (compatible; EG-Energy-Benchmark/1.0)", "Accept": "text/html"})
    with urlopen(request, timeout=35) as response:
        document = response.read().decode("utf-8", errors="replace")
    rows = OfficialRows()
    rows.feed(document)
    year = None
    values = []
    now = datetime.now(timezone.utc)
    max_period = now.strftime("%Y-%m")
    for cells in rows.rows:
        if not cells:
            continue
        first = cells[0].strip().lower()
        if re.fullmatch(r"20\d{2}", first):
            year = int(first)
            continue
        if year and first in MONTHS and len(cells) >= 4:
            period = f"{year:04d}-{MONTHS[first]:02d}"
            if period > max_period:
                continue
            try:
                eur_mwh, eur_gj, eur_smc = map(number, cells[1:4])
            except ValueError:
                continue
            # Verify units and the table's internally consistent ARERA PCS.
            if not (0 < eur_mwh < 500 and abs(eur_mwh / 3.6 - eur_gj) < 0.015
                    and abs(eur_mwh * PCS / 3.6 - eur_smc) < 0.002):
                raise ValueError(f"ARERA prices are inconsistent for {period}")
            values.append((period, eur_mwh, eur_smc))
    if not values:
        raise RuntimeError("No verifiable ARERA monthly price was parsed; retaining existing file.")
    period, eur_mwh, eur_smc = max(values)
    current = json.loads(DEST.read_text(encoding="utf-8"))
    if period <= current["reference_month"]:
        print(f"No newer ARERA period: official {period}, stored {current['reference_month']}")
        return 0
    current.update({
        "reference_month": period,
        "eur_mwh": eur_mwh,
        "eur_smc": eur_smc,
        "pcs_gj_per_smc": PCS,
        "updated_at": now.date().isoformat(),
        "observation": "Official latest published monthly ARERA PSV-based commodity benchmark; not a realtime quote or full delivered industrial tariff.",
    })
    DEST.write_text(json.dumps(current, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {period}: {eur_mwh:.4f} €/MWh GCV, {eur_smc:.6f} €/Smc")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print(f"ARERA refresh failed safely: {exc}", file=sys.stderr)
        sys.exit(1)

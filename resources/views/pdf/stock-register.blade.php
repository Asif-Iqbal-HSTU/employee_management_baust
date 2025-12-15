<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-size: 13px;
            font-family: "Times New Roman", serif;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            border: 1px solid #000;
            padding: 4px;
        }

        .center {
            text-align: center;
        }

        .right {
            text-align: right;
        }
    </style>
</head>
<body>

<h3 class="center">Bangladesh Army University of Science and Technology (BAUST)</h3>
<p><strong>Stock Register</strong></p>

<p>
    <strong>Article:</strong> {{ $product->product_name }} <br>
    <strong>Unit:</strong> {{ $product->stock_unit_name }} <br>
    <strong>Category:</strong> {{ $product->storeCategory->category_name }}
</p>

<table>
    <thead>
    <tr>
        <th colspan="7" class="center">RECEIVED ARTICLES</th>
        <th colspan="8" class="center">ISSUE ARTICLES</th>
    </tr>

    <tr>
        <th>Date</th>
        <th>From / Memo</th>
        <th>Description</th>
        <th>Office Order</th>
        <th>Rate</th>
        <th>Qty</th>
        <th>Warranty</th>

        <th>Date</th>
        <th>To Whom</th>
        <th>Voucher</th>
        <th>Qty Issued</th>
        <th>Balance</th>
        <th>Receiver</th>
        <th>Verified</th>
        <th>Remarks</th>
    </tr>
    </thead>

    <tbody>
    @php
        $balance = 0;

        /* ================= BUILD EVENT TIMELINE ================= */
        $events = [];

        foreach ($product->receives as $r) {
            $events[] = [
                'type' => 'receive',
                'date' => $r->date_of_receive,
                'data' => $r,
            ];
        }

        foreach ($product->issues as $i) {
            $events[] = [
                'type' => 'issue',
                'date' => $i->date_of_issue,
                'data' => $i,
            ];
        }

        /* ================= SORT BY DATE ================= */
        usort($events, function ($a, $b) {
            return strtotime($a['date']) <=> strtotime($b['date']);
        });
    @endphp

    @forelse($events as $event)

        {{-- ================= RECEIVE ================= --}}
        @if($event['type'] === 'receive')
            @php
                $r = $event['data'];
                $balance += $r->quantity;
            @endphp
            <tr>
                <td>{{ $r->date_of_receive }}</td>
                <td>
                    {{ $r->from_whom }}<br>
                    <small>Memo: {{ $r->memo_no }} ({{ $r->memo_date }})</small>
                </td>
                <td>{{ $product->product_name }}</td>
                <td>{{ $r->office_order_no }}</td>
                <td class="right">{{ $r->rate }}</td>
                <td class="right">{{ $r->quantity }}</td>
                <td>{{ $r->warranty_information }}</td>

                {{-- ISSUE EMPTY --}}
                <td></td>
                <td></td>
                <td></td>
                <td></td>

                <td class="right">{{ $balance }}</td>

                <td></td>
                <td></td>
                <td></td>
            </tr>

            {{-- ================= ISSUE ================= --}}
        @else
            @php
                $i = $event['data'];
                $balance -= $i->issued_quantity;
            @endphp
            <tr>
                {{-- RECEIVE EMPTY --}}
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>

                <td>{{ $i->date_of_issue }}</td>
                <td>{{ $i->voucher->requisitionedBy->name ?? '—' }}</td>
                <td>
                    {{ $i->voucher->sl_no }}<br>
                    <small>{{ $i->voucher->date }}</small>
                </td>
                <td class="right">{{ $i->issued_quantity }}</td>
                <td class="right">{{ $balance }}</td>
                <td>
                    {{ $i->voucher->receiver }}<br>
                    <small>{{ $i->voucher->department->dept_name ?? '' }}</small>
                </td>
                <td></td>
                <td></td>
            </tr>
        @endif

    @empty
        <tr>
            <td colspan="15" class="center">No data available</td>
        </tr>
    @endforelse
    </tbody>

</table>

</body>
</html>

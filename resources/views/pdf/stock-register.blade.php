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
    @php $balance = 0; @endphp

    {{-- RECEIVES --}}
    @foreach($product->receives as $r)
        @php $balance += $r->quantity; @endphp
        <tr>
            <td>{{ $r->date_of_receive }}</td>
            <td>{{ $r->from_whom }} ({{ $r->memo_no }})</td>
            <td>{{ $product->product_name }}</td>
            <td>{{ $r->office_order_no }}</td>
            <td class="right">{{ $r->rate }}</td>
            <td class="right">{{ $r->quantity }}</td>
            <td>{{ $r->warranty_information }}</td>

            <td colspan="4"></td>
            <td class="right">{{ $balance }}</td>
            <td colspan="3"></td>
        </tr>
    @endforeach

    {{-- ISSUES --}}
    @foreach($product->issues as $i)
        @php $balance -= $i->issued_quantity; @endphp
        <tr>
            <td colspan="7"></td>

            <td>{{ $i->date_of_issue }}</td>
            <td>{{ $i->voucher->requisitionedBy->name ?? '—' }}</td>
            <td>{{ $i->voucher->sl_no }}</td>
            <td class="right">{{ $i->issued_quantity }}</td>
            <td class="right">{{ $balance }}</td>
            <td>{{ $i->voucher->receiver }}</td>
            <td></td>
            <td></td>
        </tr>
    @endforeach
    </tbody>
</table>

</body>
</html>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Issue Voucher - {{ $employee->name ?? 'N/A' }} - {{ $date }}</title>
    <style>
        /* Use DejaVu Sans or a font installed on the server for PDF */
        body { font-family: DejaVu Sans, sans-serif; font-size: 10pt; padding: 20px; }
        .center { text-align: center; }
        .right { text-align: right; }
        .header-line { display: block; margin-bottom: 5px; }
        .flex-row { /* Use tables for layout in PDF instead of flex for reliable rendering */ }
        .info-table { width: 100%; border: none; margin-bottom: 10px; font-size: 10pt;}
        .info-table td { border: none; padding: 2px 0; }
        table.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .data-table th, .data-table td { border: 1px solid #000; padding: 4px; text-align: center; }
        .data-table th { background-color: #f2f2f2; }
        .data-table .left { text-align: left; }
        .data-table .right { text-align: right; }
        .signature-area { margin-top: 40px; }
        .sig-col { width: 33%; float: left; text-align: center; padding-top: 10px; }
        .sig-line { border-top: 1px solid #000; padding-top: 5px; margin: 0 auto; width: 80%; }
    </style>
</head>
<body>

<div class="center">
    <h3>BANGLADESH ARMY UNIVERSITY OF SCIENCE AND TECHNOLOGY (BAUST)</h3>
    <h2>ISSUE VOUCHER BOOK</h2>
</div>

<table class="info-table">
    <tr>
        <td style="width: 50%;">Book No: {{ $vouchers->first()->book_no ?? 'N/A' }}</td>
        <td class="right" style="width: 50%;">SL. No: {{ $vouchers->first()->sl_no ?? 'N/A' }}</td>
    </tr>
    <tr>
        <td>Department/Office: {{ $vouchers->first()->department->dept_name ?? 'N/A' }}</td>
        <td class="right">I.V.No: {{ $vouchers->first()->iv_no ?? '_______' }}</td>
    </tr>
    <tr>
        <td></td>
        <td class="right">Date: {{ $date }}</td>
    </tr>
</table>

<p style="margin-top: 15px;">Store Man,</p>
<p>Please issue the following articles to be used in {{ $vouchers->first()->department->dept_name ?? 'N/A' }} {{ $vouchers->first()->to_be_used_in_category ?? 'N/A' }}</p>

<table class="data-table">
    <thead>
    <tr>
        <th style="width: 5%;">SI No.</th>
        <th class="left" style="width: 25%;">Name of Articles</th>
        <th style="width: 15%;">Specification</th>
        <th style="width: 10%;">Unit</th>
        <th colspan="2" style="width: 15%;">Quantity</th>
        <th style="width: 15%;">Stock Reg. Book</th>
        <th style="width: 15%;">Remarks</th>
    </tr>
    <tr>
        <th></th><th></th><th></th><th></th>
        <th title="Requisitioned">Req.</th>
        <th title="Issued">Issd.</th>
        <th></th><th></th>
    </tr>
    </thead>
    <tbody>
    @foreach($vouchers as $index => $voucher)
        <tr>
            <td>{{ $index + 1 }}</td>
            <td class="left">{{ $voucher->product->product_name ?? 'N/A' }}</td>
            <td>{{ $voucher->specification ?? 'N/A' }}</td>
            <td>{{ $voucher->product->stock_unit_name ?? 'N/A' }}</td>
            <td class="right">{{ $voucher->requisitioned_quantity }}</td>
            <td class="right">{{ $voucher->issued_quantity }}</td>
            <td></td>
            <td></td>
        </tr>
    @endforeach
    </tbody>
</table>

<div class="signature-area">
    <div class="sig-col">
        <div class="sig-line">Requisition Officer: {{ $employee->name ?? 'N/A' }}</div>
    </div>
    <div class="sig-col">
        <div class="sig-line">Receiver: {{ $vouchers->first()->receiver ?? 'N/A' }}</div>
    </div>
    <div class="sig-col">
        <div class="sig-line">Sign. Of Registrar</div>
    </div>
    <div style="clear: both;"></div>
</div>

</body>
</html>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <style>
        body { font-size: 10px; }
        table { border-collapse: collapse; width: 100%; }
        th, td {
            border: 1px solid #444;
            padding: 4px;
            text-align: center;
        }
        th {
            background: #eee;
        }

        /* Ensure table fits page */
        @page {
            size: legal landscape;
            margin: 10mm;
        }

        /* Allow page breaks in long tables */
        table { page-break-inside: auto; }
        tr { page-break-inside: avoid; page-break-after: auto; }
    </style>
</head>
<body>

<h2>Attendance Matrix Report</h2>

<table>
    <thead>
    <tr>
        <th>Employee</th>
        <th>Designation</th>
        <th>TWD</th>
        <th>TP</th>
        <th>TA</th>
        <th>TEL</th>
        <th>TLE</th>

    @foreach ($dates as $d)
            <th>{{ $d }}</th>
        @endforeach
    </tr>
    </thead>

    <tbody>
    @foreach ($matrix as $row)
        <tr>
            <td>{{ $row['name'] }}</td>
            <td>{{ $row['designation'] }}</td>
            <td>{{ $row['TWD'] }}</td>
            <td>{{ $row['TP'] }}</td>
            <td>{{ $row['TA'] }}</td>
            <td>{{ $row['TEL'] }}</td>
            <td>{{ $row['TLE'] }}</td>

            @foreach ($dates as $d)
                <td>{{ $row['days'][$d] }}</td>
            @endforeach
        </tr>
    @endforeach
    </tbody>
</table>

</body>
</html>

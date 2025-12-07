<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <style>
        body { font-size: 12px; }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td {
            border: 1px solid #000;
            padding: 6px;
        }
        h2 { text-align: center; }
        @page { margin: 12mm; size: legal portrait; }
    </style>
</head>
<body>

<h2>Summary Attendance Report</h2>

<table>
    <tr><td>Total Workdays</td><td>{{ $summary['total_workdays'] }}</td></tr>
    <tr><td>Total Present</td><td>{{ $summary['present'] }}</td></tr>
    <tr><td>Total Absent</td><td>{{ $summary['absent'] }}</td></tr>
    <tr><td>Late Entry</td><td>{{ $summary['late_entry'] }}</td></tr>
    <tr><td>Early Leave</td><td>{{ $summary['early_leave'] }}</td></tr>
</table>

</body>
</html>

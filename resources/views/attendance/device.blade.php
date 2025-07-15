<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Processed Device Attendance Logs</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
    <h2>First & Last Punch per User per Day</h2>

    @if ($error)
        <div class="alert alert-danger">{{ $error }}</div>
    @endif

    <table class="table table-bordered table-striped">
        <thead>
        <tr>
            <th>#</th>
            <th>Employee ID</th>
            <th>Date</th>
            <th>Entry Time</th>
            <th>Exit Time</th>
        </tr>
        </thead>
        <tbody>
        @forelse($logs as $i => $log)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $log['employee_id'] }}</td>
                <td>{{ $log['date'] }}</td>
                <td>{{ $log['in_time'] }}</td>
                <td>{{ $log['out_time'] }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="5" class="text-center">No logs found or unable to fetch.</td>
            </tr>
        @endforelse
        </tbody>
    </table>
</div>
</body>
</html>

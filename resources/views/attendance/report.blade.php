<!DOCTYPE html>
<html>
<head>
    <title>Attendance Report</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
</head>
<body>
<div class="container mt-4">
    <h2>Attendance Report for {{ $date }}</h2>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @elseif(session('error'))
        <div class="alert alert-danger">{{ session('error') }}</div>
    @endif

    <form action="{{ route('users.sync') }}" method="POST">
        @csrf
        <button class="btn btn-secondary">🔁 Sync Users from Devices</button>
    </form>


    <form action="{{ route('logs.sync') }}" method="POST">
        @csrf
        <button class="btn btn-warning">Sync from Device</button>
    </form>

    <form method="GET" action="{{ route('attendance.report') }}">
        <input type="date" name="date" value="{{ $date }}">
        <button class="btn btn-primary">Generate Report</button>
    </form>

    <table>
        <thead>
        <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>In Time</th>
            <th>Out Time</th>
        </tr>
        </thead>
        <tbody>
        @foreach ($logs as $log)
            <tr>
                <td>{{ $log->employee_id }}</td>
                <td>{{ $log->name }}</td>
{{--                <td>{{ $log->department }}</td>--}}
                <td>{{ $log->in_time }}</td>
                <td>{{ $log->out_time }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

</div>
</body>
</html>

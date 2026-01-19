<?php

namespace App\Providers;

use App\Models\RepairRequest;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use App\Models\Leave;
use Illuminate\Support\Facades\DB;
use App\Models\IssueVoucher;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'repairCounts' => function () {
                $user = auth()->user();

                if (!$user) {
                    return [
                        'my_pending' => 0,
                        'admin_pending' => 0,
                    ];
                }

                return [
                    // Pending requests submitted by logged-in user
                    'my_pending' => RepairRequest::where('employee_id', $user->employee_id)
                        ->where('status', 'Pending')
                        ->count(),

                    // Pending requests for IT admin
                    'admin_pending' => $user->employee_id === '25052'
                        ? RepairRequest::where('status', 'Pending')->count()
                        : 0,
                ];
            },
            'leaveCounts' => function () {
                $user = auth()->user();

                if (!$user) {
                    return [
                        'head_pending' => 0,
                        'registrar_pending' => 0,
                    ];
                }

                // 🧑‍💼 Department Head pending
                $headPending = 0;

                $deptHead = DB::table('dept_heads')
                    ->where('employee_id', $user->employee_id)
                    ->first();

                if ($deptHead) {
                    $headPending = Leave::join('user_assignments', 'user_assignments.employee_id', '=', 'leaves.employee_id')
                        ->where('user_assignments.department_id', $deptHead->department_id)
                        ->where('leaves.status', 'Requested to head')
                        ->count();
                }

                // 🧾 Registrar pending
                $registrarPending = Leave::where('status', 'Sent to Registrar')->count();

                return [
                    'head_pending' => $headPending,
                    'registrar_pending' => $registrarPending,
                ];
            },
            'storeCounts' => function () {
                $user = auth()->user();

                if (!$user) {
                    return [
                        'pending_issues' => 0,
                    ];
                }

                return [
                    'pending_issues' => IssueVoucher::where('allowed_by_head', 'Yes')
                        ->where('issued_by_storeman', 'No')
                        ->count(),
                ];
            },
            'voucherRegistrarCounts' => function () {
                $user = auth()->user();

                if (!$user) {
                    return [
                        'registrar_voucher_pending' => 0,
                    ];
                }

                // 🧑‍💼 Department Head pending
                $registrarVoucherPending = 0;


                $registrarVoucherPending = IssueVoucher::where('allowed_by_registrar', 'No')->where('allowed_by_head', 'Yes')->count();

                return [
                    'registrar_voucher_pending' => $registrarVoucherPending,
                ];
            },
        ]);
    }
}

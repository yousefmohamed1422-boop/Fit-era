<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Customer & Admin Login.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Signed in successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'role' => $user->role ?? 'customer',
            ],
            'token' => $token,
        ]);
    }

    /**
     * Customer Registration.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|min:2|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'role' => 'customer',
        ]);

        Auth::login($user);
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Account created successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'role' => 'customer',
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Log out current user / revoke token.
     */
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }
        Auth::guard('web')->logout();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get authenticated user profile.
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}

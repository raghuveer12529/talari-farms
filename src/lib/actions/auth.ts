'use server';

import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function registerUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password || !name) {
        return { error: 'Missing required fields' };
    }

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: 'User with this email already exists' };
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: Role.CUSTOMER,
            },
        });

        return { success: 'User registered successfully' };
    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Something went wrong during registration' };
    }
}

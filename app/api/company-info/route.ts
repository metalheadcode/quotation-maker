import { NextRequest, NextResponse } from 'next/server';
import { getCompanyInfos, createCompanyInfo } from '@/lib/db/queries';
import { stackServerApp } from '@/stack';

// GET /api/company-info - Get all company infos for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const companyInfos = await getCompanyInfos(user.id);

    return NextResponse.json(companyInfos);
  } catch (error) {
    console.error('Error fetching company infos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company infos' },
      { status: 500 }
    );
  }
}

// POST /api/company-info - Create a new company info
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, registrationNumber, address, email, phone, isDefault } = body;

    if (!name || !address || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: name, address, email, phone' },
        { status: 400 }
      );
    }

    const companyInfo = await createCompanyInfo({
      userId: user.id,
      name,
      registrationNumber: registrationNumber || '',
      address,
      email,
      phone,
      isDefault: isDefault || false,
    });

    return NextResponse.json(companyInfo, { status: 201 });
  } catch (error) {
    console.error('Error creating company info:', error);
    return NextResponse.json(
      { error: 'Failed to create company info' },
      { status: 500 }
    );
  }
}

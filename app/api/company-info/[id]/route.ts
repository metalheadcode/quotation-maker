import { NextRequest, NextResponse } from 'next/server';
import {
  getCompanyInfoById,
  updateCompanyInfo,
  deleteCompanyInfo
} from '@/lib/db/queries';
import { stackServerApp } from '@/stack';

// GET /api/company-info/[id] - Get a specific company info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const companyInfoId = parseInt(id, 10);

    if (isNaN(companyInfoId)) {
      return NextResponse.json(
        { error: 'Invalid company info ID' },
        { status: 400 }
      );
    }

    const companyInfo = await getCompanyInfoById(companyInfoId, user.id);

    if (!companyInfo) {
      return NextResponse.json(
        { error: 'Company info not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(companyInfo);
  } catch (error) {
    console.error('Error fetching company info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company info' },
      { status: 500 }
    );
  }
}

// PUT /api/company-info/[id] - Update a company info
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const companyInfoId = parseInt(id, 10);

    if (isNaN(companyInfoId)) {
      return NextResponse.json(
        { error: 'Invalid company info ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, registrationNumber, address, email, phone, isDefault } = body;

    const updatedCompanyInfo = await updateCompanyInfo(companyInfoId, user.id, {
      userId: user.id,
      name,
      registrationNumber,
      address,
      email,
      phone,
      isDefault,
    });

    if (!updatedCompanyInfo) {
      return NextResponse.json(
        { error: 'Company info not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCompanyInfo);
  } catch (error) {
    console.error('Error updating company info:', error);
    return NextResponse.json(
      { error: 'Failed to update company info' },
      { status: 500 }
    );
  }
}

// DELETE /api/company-info/[id] - Delete a company info
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const companyInfoId = parseInt(id, 10);

    if (isNaN(companyInfoId)) {
      return NextResponse.json(
        { error: 'Invalid company info ID' },
        { status: 400 }
      );
    }

    await deleteCompanyInfo(companyInfoId, user.id);

    return NextResponse.json(
      { message: 'Company info deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting company info:', error);
    return NextResponse.json(
      { error: 'Failed to delete company info' },
      { status: 500 }
    );
  }
}

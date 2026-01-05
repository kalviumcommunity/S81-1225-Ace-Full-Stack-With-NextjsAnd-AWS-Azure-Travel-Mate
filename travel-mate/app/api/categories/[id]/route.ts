/**
 * Category by ID API Route
 *
 * RESTful API endpoints for individual category operations.
 * Supports: GET (read), PUT (update), DELETE (remove)
 *
 * Endpoints:
 * - GET    /api/categories/[id]  - Get a specific category
 * - PUT    /api/categories/[id]  - Update a category
 * - DELETE /api/categories/[id]  - Delete a category
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================
// GET /api/categories/[id] - Get a specific category
// ============================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        iconUrl: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        places: {
          take: 10,
          where: { isActive: true },
          orderBy: { rating: "desc" },
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            city: true,
            country: true,
            rating: true,
            reviewCount: true,
          },
        },
        _count: {
          select: {
            places: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    logger.info("Category fetched successfully", { categoryId: id });

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    logger.error("Failed to fetch category", { error });
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// ============================================
// PUT /api/categories/[id] - Update a category
// ============================================
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Extract updatable fields
    const { name, description, iconUrl, isActive, sortOrder } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (iconUrl !== undefined) updateData.iconUrl = iconUrl;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        iconUrl: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info("Category updated successfully", { categoryId: id });

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    logger.error("Failed to update category", { error });
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/categories/[id] - Delete a category
// ============================================
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { places: true },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has places
    if (existingCategory._count.places > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete category with associated places",
          details: { placeCount: existingCategory._count.places },
        },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info("Category deleted successfully", { categoryId: id });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    logger.error("Failed to delete category", { error });
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

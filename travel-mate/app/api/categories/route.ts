/**
 * Categories API Route
 *
 * RESTful API endpoints for category management.
 * Supports: GET (list/paginate), POST (create)
 *
 * Endpoints:
 * - GET  /api/categories       - List all categories with pagination & filtering
 * - POST /api/categories       - Create a new category
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import {
  sendPaginatedSuccess,
  sendSuccess,
  sendValidationError,
  sendConflict,
  sendError,
} from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

// ============================================
// GET /api/categories - List categories with pagination
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 10)
    );
    const skip = (page - 1) * limit;

    // Filtering parameters
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "sortOrder";
    const sortOrder = (searchParams.get("sortOrder") || "asc") as
      | "asc"
      | "desc";

    // Build where clause
    const where: Prisma.CategoryWhereInput = {};

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    } else {
      // Default to only active categories
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy clause
    const validSortFields = ["name", "sortOrder", "createdAt"];
    const orderByField = validSortFields.includes(sortBy)
      ? sortBy
      : "sortOrder";
    const orderBy = { [orderByField]: sortOrder };

    // Execute queries in parallel
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
          _count: {
            select: {
              places: true,
            },
          },
        },
      }),
      prisma.category.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    logger.info("Categories fetched successfully", { page, limit, total });

    return sendPaginatedSuccess(
      categories,
      {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      "Categories fetched successfully",
      {
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : null,
        search,
        sortBy: orderByField,
        sortOrder,
      }
    );
  } catch (error) {
    logger.error("Failed to fetch categories", { error });
    return sendError(
      "Failed to fetch categories",
      ERROR_CODES.CATEGORY_FETCH_ERROR,
      500
    );
  }
}

// ============================================
// POST /api/categories - Create a new category
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, description, iconUrl, sortOrder } = body;

    if (!name) {
      return sendValidationError({
        name: "Name is required",
      });
    }

    // Generate slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check for unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Check if category with same name exists
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return sendConflict(
        "Category with this name already exists",
        ERROR_CODES.CATEGORY_DUPLICATE
      );
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        iconUrl,
        sortOrder: sortOrder || 0,
      },
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

    logger.info("Category created successfully", { categoryId: category.id });

    return sendSuccess(category, "Category created successfully", 201);
  } catch (error) {
    logger.error("Failed to create category", { error });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return sendConflict(
          "Category with this name already exists",
          ERROR_CODES.CATEGORY_DUPLICATE
        );
      }
    }

    return sendError(
      "Failed to create category",
      ERROR_CODES.CATEGORY_CREATE_ERROR,
      500
    );
  }
}

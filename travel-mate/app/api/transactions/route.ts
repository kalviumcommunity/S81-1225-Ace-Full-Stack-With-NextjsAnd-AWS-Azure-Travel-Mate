/**
 * Transaction API Routes
 *
 * Demonstrates transaction operations with proper error handling
 */

import { NextRequest, NextResponse } from "next/server";
import { transactionService } from "@/services/transaction.service";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "demo-rollback":
        // Demonstrate rollback behavior
        const rollbackResult = await transactionService.demonstrateRollback();
        return NextResponse.json({
          success: true,
          action: "demo-rollback",
          message: "Rollback demonstration completed",
          data: rollbackResult,
        });

      default:
        return NextResponse.json({
          success: true,
          message: "Transaction API is running",
          availableActions: [
            "POST /api/transactions - Create booking with payment",
            "POST /api/transactions/trip - Create trip with places",
            "POST /api/transactions/payment - Process payment",
            "POST /api/transactions/cancel - Cancel booking with refund",
            "GET /api/transactions?action=demo-rollback - Demonstrate rollback",
          ],
          documentation: {
            transactions:
              "Use transactions when multiple operations must succeed or fail together",
            rollback: "Prisma automatically rolls back on any error",
            examples: {
              booking: "Creating booking + payment record atomically",
              trip: "Creating trip + trip members + trip places atomically",
            },
          },
        });
    }
  } catch (error) {
    logger.error("Transaction API Error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Transaction operation failed",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "create-booking": {
        // Create booking with payment transaction
        const result = await transactionService.createBookingWithPayment({
          userId: data.userId,
          placeId: data.placeId,
          tripId: data.tripId,
          totalAmount: data.totalAmount,
          currency: data.currency,
          guestCount: data.guestCount,
          specialRequests: data.specialRequests,
          checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
          checkOut: data.checkOut ? new Date(data.checkOut) : undefined,
          paymentMethod: data.paymentMethod,
        });

        if (!result.success) {
          return NextResponse.json(
            { success: false, error: result.error, rolledBack: true },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Booking and payment created successfully",
          data: result.data,
        });
      }

      case "create-trip": {
        // Create trip with places transaction
        const result = await transactionService.createTripWithPlaces({
          userId: data.userId,
          tripName: data.tripName,
          description: data.description,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          budget: data.budget,
          currency: data.currency,
          placeIds: data.placeIds || [],
        });

        if (!result.success) {
          return NextResponse.json(
            { success: false, error: result.error, rolledBack: true },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Trip created with places successfully",
          data: result.data,
        });
      }

      case "process-payment": {
        // Process payment transaction
        const result = await transactionService.processPayment(
          data.paymentId,
          data.success ?? true
        );

        if (!result.success) {
          return NextResponse.json(
            { success: false, error: result.error, rolledBack: true },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Payment processed successfully",
          data: result.data,
        });
      }

      case "cancel-booking": {
        // Cancel booking with refund transaction
        const result = await transactionService.cancelBookingWithRefund(
          data.bookingId
        );

        if (!result.success) {
          return NextResponse.json(
            { success: false, error: result.error, rolledBack: true },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Booking cancelled and refund processed",
          data: result.data,
        });
      }

      case "transfer-ownership": {
        // Transfer trip ownership transaction
        const result = await transactionService.transferTripOwnership({
          tripId: data.tripId,
          currentOwnerId: data.currentOwnerId,
          newOwnerId: data.newOwnerId,
        });

        if (!result.success) {
          return NextResponse.json(
            { success: false, error: result.error, rolledBack: true },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Trip ownership transferred successfully",
          data: result.data,
        });
      }

      case "update-ratings": {
        // Bulk update place ratings transaction
        const result = await transactionService.bulkUpdatePlaceRatings({
          placeIds: data.placeIds,
        });

        if (!result.success) {
          return NextResponse.json(
            { success: false, error: result.error, rolledBack: true },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Place ratings updated successfully",
          data: result.data,
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
            validActions: [
              "create-booking",
              "create-trip",
              "process-payment",
              "cancel-booking",
              "transfer-ownership",
              "update-ratings",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error("Transaction API POST Error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Transaction operation failed",
        rolledBack: true,
      },
      { status: 500 }
    );
  }
}

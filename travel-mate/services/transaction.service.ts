/**
 * Transaction Service
 *
 * This service demonstrates Prisma transaction patterns for maintaining
 * data integrity across multiple database operations.
 *
 * Key Concepts:
 * - Atomic operations: All operations succeed or all fail
 * - Automatic rollbacks: On error, changes are reverted
 * - Isolation: Transactions don't interfere with each other
 */

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

// Import enums from $Enums namespace for newer Prisma versions
const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  REFUNDED: "REFUNDED",
} as const;

const PaymentStatus = {
  PENDING: "PENDING",
  UNPAID: "UNPAID",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

const PaymentMethod = {
  CARD: "CARD",
  BANK_TRANSFER: "BANK_TRANSFER",
  PAYPAL: "PAYPAL",
  WALLET: "WALLET",
} as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type BookingStatusType = (typeof BookingStatus)[keyof typeof BookingStatus];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus];
type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod];

// ============================================
// TYPE DEFINITIONS
// ============================================

interface CreateBookingWithPaymentInput {
  userId: string;
  placeId: string;
  tripId?: string;
  totalAmount: number;
  currency?: string;
  guestCount?: number;
  specialRequests?: string;
  checkIn?: Date;
  checkOut?: Date;
  paymentMethod?: PaymentMethodType;
}

interface CreateTripWithPlacesInput {
  userId: string;
  tripName: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  currency?: string;
  placeIds: string[];
}

interface TransferTripOwnershipInput {
  tripId: string;
  currentOwnerId: string;
  newOwnerId: string;
}

interface BulkUpdatePlaceRatingsInput {
  placeIds: string[];
}

// ============================================
// TRANSACTION SERVICE
// ============================================

export const transactionService = {
  /**
   * Create a booking with associated payment record
   *
   * This transaction ensures:
   * 1. Booking is created
   * 2. Payment record is created
   * 3. If either fails, both are rolled back
   *
   * @example
   * const result = await transactionService.createBookingWithPayment({
   *   userId: 'user-uuid',
   *   placeId: 'place-uuid',
   *   totalAmount: 299.99,
   *   paymentMethod: 'CARD'
   * });
   */
  async createBookingWithPayment(input: CreateBookingWithPaymentInput) {
    const startTime = Date.now();
    logger.info("Starting createBookingWithPayment transaction", { input });

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Generate unique booking reference
        const bookingRef = `BK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Step 1: Create the booking
        const booking = await tx.booking.create({
          data: {
            bookingRef,
            userId: input.userId,
            placeId: input.placeId,
            tripId: input.tripId,
            totalAmount: new Prisma.Decimal(input.totalAmount),
            currency: input.currency || "USD",
            guestCount: input.guestCount || 1,
            specialRequests: input.specialRequests,
            checkIn: input.checkIn,
            checkOut: input.checkOut,
            status: BookingStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
          },
        });

        logger.info("Booking created in transaction", {
          bookingId: booking.id,
        });

        // Step 2: Create the payment record
        const payment = await tx.payment.create({
          data: {
            transactionId,
            bookingId: booking.id,
            amount: new Prisma.Decimal(input.totalAmount),
            currency: input.currency || "USD",
            method: input.paymentMethod || PaymentMethod.CARD,
            status: PaymentStatus.PENDING,
          },
        });

        logger.info("Payment record created in transaction", {
          paymentId: payment.id,
        });

        // Step 3: Update booking with payment status
        const updatedBooking = await tx.booking.update({
          where: { id: booking.id },
          data: { paymentStatus: PaymentStatus.PENDING },
          include: {
            payments: true,
            place: {
              select: { id: true, name: true, city: true, country: true },
            },
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        });

        return { booking: updatedBooking, payment };
      });

      const duration = Date.now() - startTime;
      logger.info(
        "Transaction createBookingWithPayment completed successfully",
        {
          duration: `${duration}ms`,
          bookingId: result.booking.id,
        }
      );

      return { success: true, data: result };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Transaction createBookingWithPayment failed - ROLLBACK", {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Transaction failed",
      };
    }
  },

  /**
   * Create a trip with multiple places in a single transaction
   *
   * Ensures atomicity when:
   * 1. Creating the trip
   * 2. Adding the user as trip owner
   * 3. Adding all places to the trip
   */
  async createTripWithPlaces(input: CreateTripWithPlacesInput) {
    const startTime = Date.now();
    logger.info("Starting createTripWithPlaces transaction", {
      userId: input.userId,
      placesCount: input.placeIds.length,
    });

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Step 1: Create the trip
        const trip = await tx.trip.create({
          data: {
            name: input.tripName,
            description: input.description,
            startDate: input.startDate,
            endDate: input.endDate,
            budget: input.budget ? new Prisma.Decimal(input.budget) : null,
            currency: input.currency || "USD",
            userId: input.userId,
            status: "PLANNING",
          },
        });

        logger.info("Trip created in transaction", { tripId: trip.id });

        // Step 2: Add user as trip member (owner)
        await tx.tripMember.create({
          data: {
            tripId: trip.id,
            userId: input.userId,
            role: "owner",
          },
        });

        // Step 3: Add all places to the trip using createMany for efficiency
        if (input.placeIds.length > 0) {
          await tx.tripPlace.createMany({
            data: input.placeIds.map((placeId, index) => ({
              tripId: trip.id,
              placeId,
              visitOrder: index + 1,
            })),
          });
        }

        // Fetch the complete trip with relations
        const completeTrip = await tx.trip.findUnique({
          where: { id: trip.id },
          include: {
            tripPlaces: {
              include: {
                place: {
                  select: { id: true, name: true, city: true, country: true },
                },
              },
              orderBy: { visitOrder: "asc" },
            },
            tripMembers: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        });

        return completeTrip;
      });

      const duration = Date.now() - startTime;
      logger.info("Transaction createTripWithPlaces completed successfully", {
        duration: `${duration}ms`,
        tripId: result?.id,
        placesAdded: input.placeIds.length,
      });

      return { success: true, data: result };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Transaction createTripWithPlaces failed - ROLLBACK", {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Transaction failed",
      };
    }
  },

  /**
   * Transfer trip ownership between users
   *
   * This transaction:
   * 1. Verifies current owner
   * 2. Updates trip owner
   * 3. Updates trip member roles
   */
  async transferTripOwnership(input: TransferTripOwnershipInput) {
    const startTime = Date.now();
    logger.info("Starting transferTripOwnership transaction", { ...input });

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Step 1: Verify the trip exists and belongs to current owner
        const trip = await tx.trip.findFirst({
          where: {
            id: input.tripId,
            userId: input.currentOwnerId,
          },
        });

        if (!trip) {
          throw new Error("Trip not found or user is not the owner");
        }

        // Step 2: Verify new owner exists
        const newOwner = await tx.user.findUnique({
          where: { id: input.newOwnerId },
        });

        if (!newOwner) {
          throw new Error("New owner user not found");
        }

        // Step 3: Update trip ownership
        const updatedTrip = await tx.trip.update({
          where: { id: input.tripId },
          data: { userId: input.newOwnerId },
        });

        // Step 4: Update old owner's role to editor
        await tx.tripMember.upsert({
          where: {
            tripId_userId: {
              tripId: input.tripId,
              userId: input.currentOwnerId,
            },
          },
          update: { role: "editor" },
          create: {
            tripId: input.tripId,
            userId: input.currentOwnerId,
            role: "editor",
          },
        });

        // Step 5: Add/update new owner as member with owner role
        await tx.tripMember.upsert({
          where: {
            tripId_userId: {
              tripId: input.tripId,
              userId: input.newOwnerId,
            },
          },
          update: { role: "owner" },
          create: {
            tripId: input.tripId,
            userId: input.newOwnerId,
            role: "owner",
          },
        });

        return updatedTrip;
      });

      const duration = Date.now() - startTime;
      logger.info("Transaction transferTripOwnership completed successfully", {
        duration: `${duration}ms`,
        tripId: result.id,
        newOwnerId: input.newOwnerId,
      });

      return { success: true, data: result };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Transaction transferTripOwnership failed - ROLLBACK", {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Transaction failed",
      };
    }
  },

  /**
   * Process payment and update booking status
   *
   * Demonstrates sequential transaction with conditional logic
   */
  async processPayment(paymentId: string, success: boolean) {
    const startTime = Date.now();
    logger.info("Starting processPayment transaction", { paymentId, success });

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Step 1: Get the payment
        const payment = await tx.payment.findUnique({
          where: { id: paymentId },
          include: { booking: true },
        });

        if (!payment) {
          throw new Error("Payment not found");
        }

        if (payment.status !== PaymentStatus.PENDING) {
          throw new Error(
            `Payment already processed with status: ${payment.status}`
          );
        }

        // Step 2: Update payment status
        const updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: success ? PaymentStatus.PAID : PaymentStatus.FAILED,
            processedAt: new Date(),
            gatewayResponse: success
              ? JSON.stringify({ status: "approved", code: "00" })
              : JSON.stringify({ status: "declined", code: "51" }),
          },
        });

        // Step 3: Update booking status based on payment result
        const updatedBooking = await tx.booking.update({
          where: { id: payment.bookingId },
          data: {
            paymentStatus: success ? PaymentStatus.PAID : PaymentStatus.FAILED,
            status: success ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
          },
          include: {
            place: { select: { name: true } },
            user: { select: { name: true, email: true } },
          },
        });

        return { payment: updatedPayment, booking: updatedBooking };
      });

      const duration = Date.now() - startTime;
      logger.info("Transaction processPayment completed successfully", {
        duration: `${duration}ms`,
        paymentId,
        newStatus: result.payment.status,
      });

      return { success: true, data: result };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Transaction processPayment failed - ROLLBACK", {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Transaction failed",
      };
    }
  },

  /**
   * Bulk update place ratings based on reviews
   *
   * Uses interactive transaction for complex logic
   */
  async bulkUpdatePlaceRatings(input: BulkUpdatePlaceRatingsInput) {
    const startTime = Date.now();
    logger.info("Starting bulkUpdatePlaceRatings transaction", {
      placesCount: input.placeIds.length,
    });

    try {
      const result = await prisma.$transaction(
        async (tx) => {
          const updates: Array<{
            placeId: string;
            newRating: number;
            reviewCount: number;
          }> = [];

          for (const placeId of input.placeIds) {
            // Calculate average rating from approved reviews
            const aggregation = await tx.review.aggregate({
              where: {
                placeId,
                status: "APPROVED",
              },
              _avg: { rating: true },
              _count: { id: true },
            });

            const newRating = aggregation._avg.rating || 0;
            const reviewCount = aggregation._count.id;

            // Update place with new rating
            await tx.place.update({
              where: { id: placeId },
              data: {
                rating: new Prisma.Decimal(newRating),
                reviewCount,
              },
            });

            updates.push({ placeId, newRating, reviewCount });
          }

          return updates;
        },
        {
          maxWait: 5000, // Maximum time to wait to acquire a transaction slot
          timeout: 30000, // Maximum time the transaction can run
        }
      );

      const duration = Date.now() - startTime;
      logger.info("Transaction bulkUpdatePlaceRatings completed successfully", {
        duration: `${duration}ms`,
        updatedCount: result.length,
      });

      return { success: true, data: result };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Transaction bulkUpdatePlaceRatings failed - ROLLBACK", {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Transaction failed",
      };
    }
  },

  /**
   * Cancel booking with refund
   *
   * Demonstrates a complete reversal transaction
   */
  async cancelBookingWithRefund(bookingId: string) {
    const startTime = Date.now();
    logger.info("Starting cancelBookingWithRefund transaction", { bookingId });

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Step 1: Get booking with payments
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          include: { payments: true },
        });

        if (!booking) {
          throw new Error("Booking not found");
        }

        if (booking.status === BookingStatus.CANCELLED) {
          throw new Error("Booking is already cancelled");
        }

        // Step 2: Update all paid payments to refunded
        for (const payment of booking.payments) {
          if (payment.status === PaymentStatus.PAID) {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: PaymentStatus.REFUNDED,
                processedAt: new Date(),
                gatewayResponse: JSON.stringify({
                  refundStatus: "completed",
                  refundedAt: new Date().toISOString(),
                }),
              },
            });
          }
        }

        // Step 3: Update booking status
        const cancelledBooking = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: BookingStatus.CANCELLED,
            paymentStatus: PaymentStatus.REFUNDED,
          },
          include: {
            payments: true,
            place: { select: { name: true } },
            user: { select: { name: true, email: true } },
          },
        });

        return cancelledBooking;
      });

      const duration = Date.now() - startTime;
      logger.info(
        "Transaction cancelBookingWithRefund completed successfully",
        {
          duration: `${duration}ms`,
          bookingId,
        }
      );

      return { success: true, data: result };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Transaction cancelBookingWithRefund failed - ROLLBACK", {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Transaction failed",
      };
    }
  },

  /**
   * Demonstrate transaction rollback behavior
   *
   * This function intentionally fails to show rollback in action
   */
  async demonstrateRollback() {
    const startTime = Date.now();
    logger.info(
      "Starting demonstrateRollback transaction (WILL FAIL ON PURPOSE)"
    );

    try {
      await prisma.$transaction(async (tx) => {
        // This would create a user if successful
        const user = await tx.user.create({
          data: {
            email: `rollback-test-${Date.now()}@example.com`,
            name: "Rollback Test User",
          },
        });

        logger.info("User created (will be rolled back)", { userId: user.id });

        // Intentionally throw an error to trigger rollback
        throw new Error("Intentional error to demonstrate rollback");
      });

      return { success: true };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.info("Transaction rolled back as expected", {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Verify the user was not created
      const count = await prisma.user.count({
        where: { email: { startsWith: "rollback-test-" } },
      });

      return {
        success: false,
        rolledBack: true,
        message: "Transaction was rolled back - no data was persisted",
        verificationCount: count,
      };
    }
  },
};

export default transactionService;

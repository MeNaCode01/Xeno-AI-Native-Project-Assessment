import { prisma } from "../db/prisma";

export interface AudienceCriteria {
  minSpend?: number;
  minOrders?: number;
  lastPurchaseDays?: number;
}

export interface AudienceStats {
  audienceSize: number;
  averageSpend: number;
  averageOrders: number;
}

export class AudienceService {
  /**
   * Helper to build having filters and check if zero-order customers can match criteria.
   */
  private static buildFilterParams(criteria: AudienceCriteria) {
    const { minSpend, minOrders, lastPurchaseDays } = criteria;
    const having: any = {};

    if (minSpend !== undefined) {
      having.totalAmount = {
        _sum: {
          gte: minSpend,
        },
      };
    }

    if (minOrders !== undefined) {
      having.id = {
        _count: {
          gte: minOrders,
        },
      };
    }

    if (lastPurchaseDays !== undefined) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - lastPurchaseDays);
      having.orderDate = {
        _max: {
          gte: cutoffDate,
        },
      };
    }

    // Customers with 0 orders match if all provided filters are empty/omitted/unrestrictive
    const canZeroOrderCustomersMatch =
      (minSpend === undefined || minSpend <= 0) &&
      (minOrders === undefined || minOrders === 0) &&
      (lastPurchaseDays === undefined);

    return { having, canZeroOrderCustomersMatch };
  }

  /**
   * Identifies customer IDs that satisfy all given manual audience criteria.
   * Reused by the campaign launch service to obtain the list of recipients.
   */
  static async getMatchingCustomerIds(criteria: AudienceCriteria): Promise<number[]> {
    const { having, canZeroOrderCustomersMatch } = this.buildFilterParams(criteria);

    // Query aggregated orders for customers who have placed at least 1 order
    const matchingCustomersWithOrders = await prisma.order.groupBy({
      by: ["customerId"],
      having: Object.keys(having).length > 0 ? having : undefined,
    });

    const customerIds = matchingCustomersWithOrders.map((group) => group.customerId);

    // If zero-order customers match, find their IDs and append them
    if (canZeroOrderCustomersMatch) {
      const zeroOrderCustomers = await prisma.customer.findMany({
        where: {
          orders: {
            none: {},
          },
        },
        select: {
          id: true,
        },
      });
      customerIds.push(...zeroOrderCustomers.map((c) => c.id));
    }

    return customerIds;
  }

  /**
   * Identifies customers matching specified conditions and computes audience statistics.
   */
  static async calculateManualAudience(criteria: AudienceCriteria): Promise<AudienceStats> {
    const { having, canZeroOrderCustomersMatch } = this.buildFilterParams(criteria);

    // Query aggregated orders for customers who have placed at least 1 order
    const matchingCustomersWithOrders = await prisma.order.groupBy({
      by: ["customerId"],
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
      having: Object.keys(having).length > 0 ? having : undefined,
    });

    let audienceSize = matchingCustomersWithOrders.length;
    let totalSpend = 0;
    let totalOrders = 0;

    for (const group of matchingCustomersWithOrders) {
      totalSpend += Number(group._sum?.totalAmount || 0);
      totalOrders += group._count?.id || 0;
    }

    if (canZeroOrderCustomersMatch) {
      const zeroOrderCustomersCount = await prisma.customer.count({
        where: {
          orders: {
            none: {},
          },
        },
      });
      audienceSize += zeroOrderCustomersCount;
    }

    let averageSpend = 0;
    let averageOrders = 0;

    if (audienceSize > 0) {
      averageSpend = totalSpend / audienceSize;
      averageOrders = totalOrders / audienceSize;
    }

    return {
      audienceSize,
      averageSpend: parseFloat(averageSpend.toFixed(2)),
      averageOrders: parseFloat(averageOrders.toFixed(2)),
    };
  }
}

import prismaClient from '../../config/prisma.js';
import { Prisma } from '@prisma/client';

export type OrderProfileScope = 'PRODUCT' | 'INGREDIENT';

export interface ScopedOrderPosition {
  id: string;
  position: number;
}

export class ScopedOrderProfileService {
  constructor(private readonly scope: OrderProfileScope) {}

  async save(name: string, positions: ScopedOrderPosition[]) {
    return prismaClient.customOrderProfile.create({
      data: {
        name: name.trim(),
        positions: positions.map(({ id, position }) => ({ id, position })),
        scope: this.scope
      }
    });
  }

  async list() {
    return prismaClient.customOrderProfile.findMany({
      where: { scope: this.scope },
      orderBy: { createdAt: 'desc' }
    });
  }

  async rename(id: string, newName: string) {
    const profile = await prismaClient.customOrderProfile.findFirst({
      where: { id, scope: this.scope },
      select: { id: true }
    });

    if (!profile) throw new Error('OrderProfileNotFoundException');

    try {
      return await prismaClient.customOrderProfile.update({
        where: { id },
        data: { name: newName.trim() }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('OrderProfileNotFoundException');
      }
      throw error;
    }
  }

  async delete(id: string) {
    const profile = await prismaClient.customOrderProfile.findFirst({
      where: { id, scope: this.scope },
      select: { id: true }
    });

    if (!profile) throw new Error('OrderProfileNotFoundException');

    try {
      return await prismaClient.customOrderProfile.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('OrderProfileNotFoundException');
      }
      throw error;
    }
  }
}

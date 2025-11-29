import { z } from 'zod';

/**
 * Schema Zod para props de ProductItem component
 * Define el contrato de datos que el componente espera recibir
 */
export const ProductPropsSchema = z.object({
  id: z.string().uuid('ID debe ser un UUID válido'),
  name: z.string().min(1, 'Nombre no puede estar vacío'),
  price: z.number().nonnegative('Precio debe ser no negativo'),
  currency: z.enum(['PEN', 'USD', 'EUR'], {
    errorMap: () => ({ message: 'Moneda debe ser PEN, USD o EUR' }),
  }),
  inStock: z.boolean(),
});

export type ProductProps = z.infer<typeof ProductPropsSchema>;

/**
 * Props por defecto para el componente
 */
export const defaultProductProps: ProductProps = {
  id: '550e8400-e29b-41d4-a716-446655440010',
  name: 'Producto de ejemplo',
  price: 25,
  currency: 'PEN',
  inStock: true,
};

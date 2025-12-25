import { Type, Static } from '@feathersjs/typebox'
import { querySyntax } from '@feathersjs/typebox'

/**
 * Main Vendor schema
 */
export const vendorSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    country: Type.String(),
    active: Type.Boolean(),
    created_at: Type.Optional(Type.String({ format: 'date-time' })),
    updated_at: Type.Optional(Type.String({ format: 'date-time' }))
  },
  {
    $id: 'Vendor',
    additionalProperties: false
  }
)

export type Vendor = Static<typeof vendorSchema>

/**
 * Data allowed when creating a vendor
 */
export const vendorDataSchema = Type.Pick(vendorSchema, [
  'name',
  'country'
])

export type VendorData = Static<typeof vendorDataSchema>

/**
 * Data allowed when patching a vendor
 */
export const vendorPatchSchema = Type.Partial(vendorDataSchema)

export type VendorPatch = Static<typeof vendorPatchSchema>

/**
 * Query schema
 */
export const vendorQuerySchema = Type.Intersect(
  [
    querySyntax(
      Type.Pick(vendorSchema, [
        'id',
        'name',
        'country',
        'active'
      ])
    ),
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)

export type VendorQuery = Static<typeof vendorQuerySchema>

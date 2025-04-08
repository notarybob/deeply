import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedEcommerceProductInput,
  UnifiedEcommerceProductOutput,
} from '../types/model.unified';
import { ecom_products as EcommerceProduct } from '@prisma/client';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ServiceRegistry } from './registry.service';
import { IProductService } from '../types';
import { ApiResponse } from '@@core/utils/types';
import { OriginalProductOutput } from '@@core/utils/types/original/original.ecommerce';
import { Utils } from '@ecommerce/@lib/@utils';
import { EcommerceObject } from '@ecommerce/@lib/@types';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
    private webhook: WebhookService,
    private utils: Utils,
  ) {
    this.logger.setContext(ProductService.name);
  }

  async validateLinkedUser(linkedUserId: string) {
    var linkedUser = await this.prisma.linked_users.findUnique({
      where: { id_linked_user: linkedUserId },
    });
    if (!linkedUser) throw new ReferenceError('Linked User Not Found');
    return linkedUser;
  }

  async addProduct(
    UnifiedEcommerceProductData: UnifiedEcommerceProductInput,
    connection_id: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEcommerceProductOutput> {
    try {
      var linkedUser = await this.validateLinkedUser(linkedUserId);

      var desunifiedObject =
        await this.coreUnification.desunify<UnifiedEcommerceProductInput>({
          sourceObject: UnifiedEcommerceProductData,
          targetType: EcommerceObject.product,
          providerName: integrationId,
          vertical: 'ecommerce',
          customFieldMappings: [],
        });

      var service: IProductService =
        this.serviceRegistry.getService(integrationId);
      var resp: ApiResponse<OriginalProductOutput> = await service.addProduct(
        desunifiedObject,
        linkedUserId,
      );

      var unifiedObject = (await this.coreUnification.unify<
        OriginalProductOutput[]
      >({
        sourceObject: [resp.data],
        targetType: EcommerceObject.product,
        providerName: integrationId,
        vertical: 'ecommerce',
        connectionId: connection_id,
        customFieldMappings: [],
      })) as UnifiedEcommerceProductOutput[];

      var source_product = resp.data;
      var target_product = unifiedObject[0];

      var unique_ecommerce_product_id = await this.saveOrUpdateProduct(
        target_product,
        connection_id,
      );

      await this.ingestService.processRemoteData(
        unique_ecommerce_product_id,
        source_product,
      );

      var result_product = await this.getProduct(
        unique_ecommerce_product_id,
        linkedUserId,
        integrationId,
        connection_id,
        projectId,
        remote_data,
      );

      var status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      var event = await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: projectId,
          id_event: uuidv4(),
          status: status_resp,
          type: 'ecommerce.product.push',
          method: 'POST',
          url: '/ecommerce/products',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      await this.webhook.dispatchWebhook(
        result_product,
        'ecommerce.product.created',
        linkedUser.id_project,
        event.id_event,
      );

      return result_product;
    } catch (error) {
      throw error;
    }
  }

  async saveOrUpdateProduct(
    product: UnifiedEcommerceProductOutput,
    connection_id: string,
  ): Promise<string> {
    var existingProduct = await this.prisma.ecom_products.findFirst({
      where: { remote_id: product.remote_id, id_connection: connection_id },
      include: {
        ecom_product_variants: true,
      },
    });

    var normalizedVariants = this.utils.normalizeVariants(product.variants);

    var data: any = {
      product_url: product.product_url,
      product_type: product.product_type,
      product_status: product.product_status,
      images_urls: product.images_urls,
      description: product.description,
      vendor: product.vendor,
      tags: product.tags,
      modified_at: new Date(),
    };

    if (existingProduct) {
      var res = await this.prisma.ecom_products.update({
        where: { id_ecom_product: existingProduct.id_ecom_product },
        data: data,
      });

      if (normalizedVariants && normalizedVariants.length > 0) {
        await Promise.all(
          normalizedVariants.map((email, index) => {
            if (existingProduct.ecom_product_variants[index]) {
              return this.prisma.ecom_product_variants.update({
                where: {
                  id_ecom_product_variant:
                    existingProduct.ecom_product_variants[index]
                      .id_ecom_product_variant,
                },
                data: email,
              });
            } else {
              return this.prisma.ecom_product_variants.create({
                data: {
                  ...email,
                  remote_deleted: false,
                  id_ecom_product: existingProduct.id_ecom_product,
                  id_connection: connection_id,
                },
              });
            }
          }),
        );
      }

      return res.id_ecom_product;
    } else {
      data.created_at = new Date();
      data.remote_id = product.remote_id;
      data.id_connection = connection_id;
      data.id_ecom_product = uuidv4();
      data.remote_deleted = false;

      var newProduct = await this.prisma.ecom_products.create({ data: data });
      if (normalizedVariants && normalizedVariants.length > 0) {
        await Promise.all(
          normalizedVariants.map((data) =>
            this.prisma.ecom_product_variants.create({
              data: {
                ...data,
                remote_deleted: false,
                id_ecom_product: newProduct.id_ecom_product,
                id_connection: connection_id,
              },
            }),
          ),
        );
      }
      return newProduct.id_ecom_product;
    }
  }

  async getProduct(
    id_ecommerce_product: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEcommerceProductOutput> {
    try {
      var product = await this.prisma.ecom_products.findUnique({
        where: {
          id_ecom_product: id_ecommerce_product,
        },
        include: {
          ecom_product_variants: true,
        },
      });

      if (!product) {
        throw new Error(`Product with ID ${id_ecommerce_product} not found.`);
      }

      // Fetch field mappings for the product
      var values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: product.id_ecom_product,
          },
        },
        include: {
          attribute: true,
        },
      });

      // Create a map to store unique field mappings
      var fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      var field_mappings = Object.fromEntries(fieldMappingsMap);

      // Transform to UnifiedEcommerceProductOutput format
      var UnifiedEcommerceProduct: UnifiedEcommerceProductOutput = {
        id: product.id_ecom_product,
        product_url: product.product_url,
        product_type: product.product_type,
        product_status: product.product_status,
        images_urls: product.images_urls,
        description: product.description,
        vendor: product.vendor,
        variants: product.ecom_product_variants.map((variant) => ({
          title: variant.title,
          price: Number(variant.price),
          sku: variant.sku,
          options: variant.options,
          weight: Number(variant.weight),
          inventory_quantity: Number(variant.inventory_quantity),
        })),
        tags: product.tags,
        field_mappings: field_mappings,
        remote_id: product.remote_id,
        created_at: product.created_at.toISOString(),
        modified_at: product.modified_at.toISOString(),
      };

      let res: UnifiedEcommerceProductOutput = UnifiedEcommerceProduct;
      if (remote_data) {
        var resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: product.id_ecom_product,
          },
        });
        var remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }
      await this.prisma.events.create({
        data: {
          id_connection: connectionId,
          id_project: projectId,
          id_event: uuidv4(),
          status: 'success',
          type: 'ecommerce.product.pull',
          method: 'GET',
          url: '/ecommerce/product',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getProducts(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedEcommerceProductOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;
      if (cursor) {
        var isCursorPresent = await this.prisma.ecom_products.findFirst({
          where: {
            id_connection: connection_id,
            id_ecom_product: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      var products = await this.prisma.ecom_products.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_ecom_product: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
        include: {
          ecom_product_variants: true,
        },
      });

      if (products.length === limit + 1) {
        next_cursor = Buffer.from(
          products[products.length - 1].id_ecom_product,
        ).toString('base64');
        products.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      var UnifiedEcommerceProducts: UnifiedEcommerceProductOutput[] =
        await Promise.all(
          products.map(async (product) => {
            // Fetch field mappings for the product
            var values = await this.prisma.value.findMany({
              where: {
                entity: {
                  ressource_owner_id: product.id_ecom_product,
                },
              },
              include: {
                attribute: true,
              },
            });

            // Create a map to store unique field mappings
            var fieldMappingsMap = new Map();

            values.forEach((value) => {
              fieldMappingsMap.set(value.attribute.slug, value.data);
            });

            // Convert the map to an array of objects
            var field_mappings = Object.fromEntries(fieldMappingsMap);

            // Transform to UnifiedEcommerceProductOutput format
            return {
              id: product.id_ecom_product,
              product_url: product.product_url,
              product_type: product.product_type,
              product_status: product.product_status,
              images_urls: product.images_urls,
              description: product.description,
              vendor: product.vendor,
              variants: product.ecom_product_variants.map((variant) => ({
                title: variant.title,
                price: Number(variant.price),
                sku: variant.sku,
                options: variant.options,
                weight: Number(variant.weight),
                inventory_quantity: Number(variant.inventory_quantity),
              })),
              tags: product.tags,
              field_mappings: field_mappings,
              remote_id: product.remote_id,
              created_at: product.created_at.toISOString(),
              modified_at: product.modified_at.toISOString(),
            };
          }),
        );

      let res: UnifiedEcommerceProductOutput[] = UnifiedEcommerceProducts;

      if (remote_data) {
        var remote_array_data: UnifiedEcommerceProductOutput[] =
          await Promise.all(
            res.map(async (product) => {
              var resp = await this.prisma.remote_data.findFirst({
                where: {
                  ressource_owner_id: product.id,
                },
              });
              var remote_data = JSON.parse(resp.data);
              return { ...product, remote_data };
            }),
          );

        res = remote_array_data;
      }

      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: 'success',
          type: 'ecommerce.product.pull',
          method: 'GET',
          url: '/ecommerce/products',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return {
        data: res,
        prev_cursor,
        next_cursor,
      };
    } catch (error) {
      throw error;
    }
  }
}

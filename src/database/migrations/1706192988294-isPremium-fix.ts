import { MigrationInterface, QueryRunner } from "typeorm";

export class IsPremiumFix1706192988294 implements MigrationInterface {
    name = 'IsPremiumFix1706192988294'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "isPremium" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "isPremium" SET NOT NULL`);
    }

}

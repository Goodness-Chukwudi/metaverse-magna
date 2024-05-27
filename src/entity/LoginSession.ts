import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BIT } from "../data/enums/enum";

@Entity()
class LoginSession {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int")
    user_id: number;

    @Column({type: "timestamp", default: new Date(Date.now() + 86400000)}) //1 day
    validity_end_date: Date;

    @Column({type: "boolean", default: false})
    logged_out: boolean;

    @Column({type: "boolean", default: false})
    is_expired: boolean;

    @Column({type: "enum", enum: Object.values(BIT), default: BIT.OFF})
    status: number;
}

export default LoginSession;
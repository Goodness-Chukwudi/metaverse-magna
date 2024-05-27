import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import User from "./User";
import { ITEM_STATUS } from "../data/enums/enum";

@Entity()
class UserPassword {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    password: string;

    @Column()
    email: string;

    @OneToOne(() => User, (user) => user.password)
    user: User;

    @Column({type: "enum", enum: Object.values(ITEM_STATUS), default: ITEM_STATUS.ACTIVE})
    status: string;
}

export default UserPassword;
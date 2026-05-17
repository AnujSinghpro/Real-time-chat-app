import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type GroupDocument = Group & Document;

@Schema({ timestamps: true, })

export class Group {

    @Prop()
    groupId: string;

    @Prop()
    groupName: string;

    @Prop([String])
    members: string[];

}
export const GroupSchema = SchemaFactory.createForClass(Group);
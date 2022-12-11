import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

export default class Message extends Model {
    static table = 'messages';

    @text('text') text: string | undefined;

    @text('title') title: string | undefined;

    @text('body') body: string | undefined;

    @field('is_pinned') isPinned: boolean | undefined;

    @date('last_event_at') lastEventAt: Date | undefined;
}

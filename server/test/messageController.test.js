import assert from 'node:assert/strict';
import test from 'node:test';
import Message from '../models/message.js';
import { getMessages } from '../controllers/messageController.js';

test('getMessages excludes messages deleted for the requesting user', async () => {
  const originalFind = Message.find;
  const originalUpdateMany = Message.updateMany;
  let query;
  Message.find = async (value) => {
    query = value;
    return [];
  };
  Message.updateMany = async () => {};

  try {
    const response = {
      json(body) {
        this.body = body;
      },
    };
    await getMessages({ params: { id: 'other-user' }, user: { _id: 'current-user' } }, response);

    assert.deepEqual(query.deletedFor, { $ne: 'current-user' });
    assert.equal(response.body.success, true);
  } finally {
    Message.find = originalFind;
    Message.updateMany = originalUpdateMany;
  }
});

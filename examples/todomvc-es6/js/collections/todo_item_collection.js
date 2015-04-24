/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

import { TodoItemModel } from '../models/todo_item_model.js';
import { Collection } from 'tungstenjs/adaptors/backbone';
export class TodoItemCollection extends Collection {}
// Attaching to prototype is a temporary hack,
// pending outcome of https://github.com/jashkenas/backbone/issues/3560
TodoItemCollection.prototype.model = TodoItemModel;

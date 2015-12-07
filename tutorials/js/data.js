window.data = {
  tutorials: [
    {name: 'Hello World', description: 'First tungsten.js app', template: `<strong>Hello, {{name}}!</strong>`, js: `var View = tungsten.backbone.View, Model = tungsten.backbone.Model;
new View({ el: '#app', template: compiledTemplates.app_view, model: new Model({name: 'world'}), dynamicInitialize: true });`},
    {
    name: 'TodoMVC',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam dolorem, odit perferendis sint voluptas voluptates. Amet distinctio dolor eos esse inventore molestias recusandae rerum sequi veritatis voluptatibus! Ab, dignissimos quis.',
    template: `<div class="todoapp">
  <header class="header">
    <h1>todos</h1>
    <!-- todoapp -->
    <input placeholder="What needs to be done?" type="text" autofocus="true" class="new-todo js-new-todo">
  </header>
  <section class="main">
    <input class="toggle-all js-toggle-all" type="checkbox" {{#allCompleted}}checked="checked"{{/allCompleted}}>
    <label for="toggle-all">Mark all as complete</label>
    <ul class="todo-list js-todo-list">
    {{#todoItems}}
    {{^hidden}}
      <li class="js-todo-item {{#completed}} completed {{/completed}} {{#editing}} editing {{/editing}}">
      <!-- {{title}} -->
      {{^editing}}
        <div class="view">
          <input class="toggle js-toggle" type="checkbox" {{#completed}}checked="checked"{{/completed}}>
          <label class="js-todo-title">{{title}}</label>
          <button class="destroy js-destroy"></button>
        </div>
      {{/editing}}
      {{#editing}}
      <input class="edit js-todo-edit" value="{{title}}">
      {{/editing}}
    </li>
  {{/hidden}}

        {{/todoItems}}
  </ul>
  </section>
  {{#hasTodos}}
  <footer class="footer">
  <span class="js-todo-count todo-count"><strong>{{todoCount}}</strong> item{{#todoCountPlural}}s{{/todoCountPlural}} left</span>
  {{#hasCompleted}}
  <button class="clear-completed js-clear-completed">Clear completed</button>
  {{/hasCompleted}}
  </footer>
  {{/hasTodos}}
</div>`,
    js: `var View = tungsten.backbone.View, Model = tungsten.backbone.Model, Collection = tungsten.backbone.Collection;
var ENTER_KEY = 13;
var ESC_KEY = 27;
var TodoItemView = View.extend({
  events: {
    'blur .js-todo-edit': 'handleBlurTodoEdit',
    'click .js-toggle': 'handleClickToggle',
    'click .js-destroy': 'handleClickDestroy',
    'dblclick .js-todo-title': 'handleDblClickTodoTitle',
    'keydown .js-todo-edit': 'handleKeyDownTodoEdit',
    'keypress .js-todo-edit': 'handleKeyPressTodoEdit'
  },
  handleBlurTodoEdit: function(e) {
    if (!this.model.get('editing')) {
      return;
    }
    this.clear(e.currentTarget);
  },
  handleClickDestroy: function() {
    this.model.destroy();
  },
  handleClickToggle: function() {
        console.log(this.model);
    this.model.toggle();
  },
  handleDblClickTodoTitle: function(e) {
    this.model.set('editing', true);
    e.currentTarget.focus();
  },
  handleKeyDownTodoEdit: function(e) {
    if (e.which === ESC_KEY) {
      this.model.set('editing', false);
      this.model.set('title', this.model.get('title'));
    }
  },
  handleKeyPressTodoEdit: function(e) {
    if (e.which === ENTER_KEY) {
      this.clear(e.currentTarget);
    }
  },
  clear: function(input) {
    var value = input.value;

    var trimmedValue = value.trim();

    if (trimmedValue) {
      this.model.set({ title: trimmedValue });
      input.value = '';
      this.model.set('editing', false);
      if (value !== trimmedValue) {
        this.model.trigger('change');
      }
    } else {
      this.handleClickDestroy();
    }
  }
}, {
  debugName: 'TodoItemView'
});

var NewItemView = View.extend({
  events: {
    'keyup': 'handleKeyup'
  },
  handleKeyup: function(e) {
    if (e.which === ENTER_KEY && e.currentTarget.value !== '') {
      this.model.trigger('addItem', e.currentTarget.value.trim());
      this.el.value = '';
    }
  }
}, {
  debugName: 'NewTodoItemView'
});

var AppView = View.extend({
  childViews: {
    'js-new-todo': NewItemView,
    'js-todo-item': TodoItemView
  },
  events: {
    'click .js-toggle-all': 'handleClickToggleAll',
    'click .js-clear-completed': 'handleClickClearCompleted'
  },
  handleClickClearCompleted: function() {
    _.invoke(this.model.get('todoItems').where({completed: true}), 'destroy');
    return false;
  },
  handleClickToggleAll: function(e) {
    var completed = e.currentTarget.checked;
    this.model.get('todoItems').each(function(item) {
      item.set('completed', completed);
    });
  }
}, {
  debugName: 'TodoAppView'
});
var ItemModel = Model.extend({
  toggle: function() {
    this.set({
      completed: !this.get('completed')
    });
  }
});
var ItemCollection = Collection.extend({
  model: ItemModel
});
var AppModel = Model.extend({
  relations: {
    todoItems: ItemCollection
  },
  defaults: {
    todoItems: [],
  },
  postInitialize: function() {
    this.listenTo(this, 'addItem', function(title) {
      // @todo add code to clear toggle-all button
      this.get('todoItems').add({title: title});
    });
  },
  derived: {
    hasTodos: {
      deps: ['todoItems'],
      fn: function() {
        return this.get('todoItems').length > 0;
      }
    },
    incompletedItems: {
      deps: ['todoItems'],
      fn: function() {
        return this.get('todoItems').filter(function(item) {
          return !item.get('completed');
        });
      }
    },
    allCompleted: {
      deps: ['todoItems'],
      fn: function() {
        if (this.get('todoItems').length) {
          return this.get('todoItems').every(function(item) {
            return item.get('completed');
          });
        }
      }
    },
    todoCount: {
      deps: ['incompletedItems'],
      fn: function() {
        return this.get('incompletedItems').length;
      }
    },
    todoCountPlural: {
      deps: ['todoCount'],
      fn: function() {
        return this.get('todoCount') !== 1;
      }
    },
    hasCompleted: {
      deps: ['todoItems'],
      fn: function() {
        return this.get('todoItems').length - this.get('incompletedItems').length > 0;
      }
    }
  }
});

new AppView({
    el: '#app',
    template: compiledTemplates.app_view,
    model: new AppModel(),
    dynamicInitialize: true
});`
  }]
};
import type { JsonASTNode } from '@/lib/next-json-component';

export const counterTemplate: JsonASTNode = {
  type: 'div',
  props: { className: 'counter-widget' },
  children: [
    {
      type: 'div',
      props: { className: 'counter-display' },
      children: ['{{ state.count }}'],
    },
    {
      type: 'div',
      props: { className: 'counter-btns' },
      children: [
        {
          type: 'button',
          props: {
            className: 'btn-counter btn-counter-secondary',
            onClick: { action: 'decrement' },
            title: '減少',
          },
          children: ['−'],
        },
        {
          type: 'button',
          props: {
            className: 'btn-counter btn-counter-primary',
            onClick: { action: 'increment' },
            title: '增加',
          },
          children: ['+'],
        },
      ],
    },
    {
      type: 'button',
      props: { className: 'btn-reset', onClick: { action: 'reset' } },
      children: ['重設'],
    },
    {
      type: 'p',
      props: { className: 'milestone' },
      $if: '{{ state.count >= 10 }}',
      children: ['🎉 恭喜達到 10！'],
    },
    {
      type: 'p',
      props: { className: 'counter-info' },
      children: ['由 Zustand ({{ state.count >= 0 ? "scoped store" : "" }}) 驅動'],
    },
  ],
};

export const todoTemplate: JsonASTNode = {
  type: 'div',
  props: { className: 'todo-wrap' },
  children: [
    {
      type: 'div',
      props: { className: 'todo-header' },
      children: [
        { type: 'h2', props: { className: 'todo-title' }, children: ['待辦事項'] },
        { type: 'span', props: { className: 'todo-count' }, children: ['{{ state.todos.length }} 項'] },
      ],
    },
    {
      type: 'div',
      props: { className: 'todo-actions-row' },
      children: [
        {
          type: 'button',
          props: { className: 'btn-add-todo', onClick: { action: 'addTodo' } },
          children: ['+ 新增待辦'],
        },
        {
          type: 'button',
          props: { className: 'btn-clear', onClick: { action: 'clearAll' } },
          $if: '{{ state.todos.length > 0 }}',
          children: ['清除全部'],
        },
      ],
    },
    {
      type: 'div',
      props: { className: 'todo-empty' },
      $if: '{{ state.todos.length === 0 }}',
      children: [
        { type: 'div', props: { className: 'todo-empty-icon' }, children: ['📋'] },
        { type: 'p', children: ['尚無待辦事項，點擊新增！'] },
      ],
    },
    {
      type: 'ul',
      props: { className: 'todo-list' },
      $if: '{{ state.todos.length > 0 }}',
      children: [
        {
          type: 'li',
          props: { className: 'todo-item' },
          $each: '{{ state.todos }}',
          $as: 'todo',
          $key: '{{ todo.id }}',
          children: [
            {
              type: 'span',
              props: { className: "{{ todo.done ? 'todo-text done' : 'todo-text' }}" },
              children: ['{{ todo.text }}'],
            },
            {
              type: 'button',
              props: {
                className: "{{ todo.done ? 'btn-icon done' : 'btn-icon' }}",
                title: '切換狀態',
                onClick: { action: 'toggleTodo', args: ['{{ todo.id }}'] },
              },
              children: ["{{ todo.done ? '↩' : '✓' }}"],
            },
            {
              type: 'button',
              props: {
                className: 'btn-icon btn-icon-del',
                title: '刪除',
                onClick: { action: 'deleteTodo', args: ['{{ todo.id }}'] },
              },
              children: ['×'],
            },
          ],
        },
      ],
    },
  ],
};

export const headlessUITemplate: JsonASTNode = {
  type: 'div',
  props: { className: 'hui-container' },
  children: [
    {
      type: 'div',
      props: { className: 'hui-card' },
      children: [
        { type: 'div', props: { className: 'hui-card-title' }, children: ['1. Menu (Dropdown)'] },
        {
          type: 'Menu',
          props: { as: 'div', className: 'hui-menu-relative' },
          children: [
            { type: 'MenuButton', props: { className: 'hui-btn' }, children: ['Options ▾'] },
            {
              type: 'MenuItems',
              props: { className: 'hui-menu-items', transition: true },
              children: [
                { type: 'MenuItem', props: { as: 'button', className: 'hui-menu-item' }, children: ['Account settings'] },
                { type: 'MenuItem', props: { as: 'button', className: 'hui-menu-item' }, children: ['Documentation'] },
                { type: 'MenuItem', props: { as: 'button', className: 'hui-menu-item' }, children: ['License'] },
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'div',
      props: { className: 'hui-card' },
      children: [
        { type: 'div', props: { className: 'hui-card-title' }, children: ['2. Disclosure (Accordion)'] },
        {
          type: 'Disclosure',
          children: [
            {
              type: 'DisclosureButton',
              props: { className: 'hui-disclosure-btn' },
              children: ['What is your refund policy? ▾']
            },
            {
              type: 'DisclosurePanel',
              props: { className: 'hui-disclosure-panel' },
              children: ["If you're unhappy with your purchase for any reason, email us within 90 days and we'll refund you in full, no questions asked."]
            }
          ]
        }
      ]
    },
    {
      type: 'div',
      props: { className: 'hui-card' },
      children: [
        { type: 'div', props: { className: 'hui-card-title' }, children: ['3. Dialog (Modal)'] },
        {
          type: 'button',
          props: { className: 'hui-btn', onClick: { action: 'setIsOpen', args: [true] } },
          children: ['Open Dialog']
        },
        {
          type: 'Dialog',
          props: {
            open: '{{ state.isDialogOpen }}',
            onClose: { action: 'setIsOpen', args: [false] },
            className: 'hui-dialog'
          },
          children: [
            { type: 'DialogBackdrop', props: { className: 'hui-dialog-backdrop', transition: true } },
            {
              type: 'div',
              props: { className: 'hui-dialog-container' },
              children: [
                {
                  type: 'DialogPanel',
                  props: { className: 'hui-dialog-panel', transition: true },
                  children: [
                    { type: 'DialogTitle', props: { className: 'hui-dialog-title' }, children: ['Payment successful'] },
                    { type: 'p', props: { className: 'hui-dialog-desc' }, children: ["Your payment has been successfully submitted. We've sent you an email with all of the details of your order."] },
                    {
                      type: 'button',
                      props: { className: 'hui-btn', onClick: { action: 'setIsOpen', args: [false] } },
                      children: ['Got it, thanks!']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'div',
      props: { className: 'hui-card' },
      children: [
        { type: 'div', props: { className: 'hui-card-title' }, children: ['4. Popover'] },
        {
          type: 'Popover',
          props: { className: 'hui-popover' },
          children: [
            { type: 'PopoverButton', props: { className: 'hui-btn' }, children: ['Solutions ▾'] },
            {
              type: 'PopoverPanel',
              props: { className: 'hui-popover-panel' },
              children: [
                { type: 'div', props: { style: { marginBottom: 8 } }, children: ['Analytics'] },
                { type: 'div', props: { style: { marginBottom: 8 } }, children: ['Engagement'] },
                { type: 'div', children: ['Security'] }
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'div',
      props: { className: 'hui-card' },
      children: [
        { type: 'div', props: { className: 'hui-card-title' }, children: ['5. Listbox (Select)'] },
        {
          type: 'Listbox',
          props: { value: '{{ state.selectedPerson }}', onChange: { action: 'setSelectedPerson' } },
          children: [
            {
              type: 'div',
              props: { className: 'hui-select-wrap' },
              children: [
                { type: 'ListboxButton', props: { className: 'hui-select-btn' }, children: ['{{ state.selectedPerson }} ▾'] },
                {
                  type: 'ListboxOptions',
                  props: { className: 'hui-select-options' },
                  children: [
                    { type: 'ListboxOption', props: { value: 'Durward Reynolds', className: 'hui-select-option' }, children: ['Durward Reynolds'] },
                    { type: 'ListboxOption', props: { value: 'Kenton Towne', className: 'hui-select-option' }, children: ['Kenton Towne'] },
                    { type: 'ListboxOption', props: { value: 'Therese Wunsch', className: 'hui-select-option' }, children: ['Therese Wunsch'] }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'div',
      props: { className: 'hui-card' },
      children: [
        { type: 'div', props: { className: 'hui-card-title' }, children: ['6. Switch'] },
        {
          type: 'div',
          props: { className: 'hui-switch-container' },
          children: [
            {
              type: 'Switch',
              props: {
                checked: '{{ state.switchValue }}',
                onChange: { action: 'setSwitchValue' },
                className: 'hui-switch'
              },
              children: [
                { type: 'span', props: { className: 'hui-switch-thumb' } }
              ]
            },
            { type: 'span', props: { className: 'hui-switch-label' }, children: ["{{ state.switchValue ? 'Enabled' : 'Disabled' }}"] }
          ]
        }
      ]
    },
    {
      type: 'div',
      props: { className: 'hui-card' },
      children: [
        { type: 'div', props: { className: 'hui-card-title' }, children: ['7. RadioGroup'] },
        {
          type: 'RadioGroup',
          props: {
            value: '{{ state.selectedPlan }}',
            onChange: { action: 'setPlan' },
            className: 'hui-radio-group'
          },
          children: [
            {
              type: 'RadioGroupOption',
              props: { value: 'Startup', className: 'hui-radio-option' },
              children: [
                { type: 'div', props: { className: 'hui-radio-circle' }, children: [{ type: 'div', props: { className: 'hui-radio-dot' } }] },
                { type: 'span', props: { className: 'hui-radio-label' }, children: ['Startup Plan'] }
              ]
            },
            {
              type: 'RadioGroupOption',
              props: { value: 'Business', className: 'hui-radio-option' },
              children: [
                { type: 'div', props: { className: 'hui-radio-circle' }, children: [{ type: 'div', props: { className: 'hui-radio-dot' } }] },
                { type: 'span', props: { className: 'hui-radio-label' }, children: ['Business Plan'] }
              ]
            },
            {
              type: 'RadioGroupOption',
              props: { value: 'Enterprise', className: 'hui-radio-option' },
              children: [
                { type: 'div', props: { className: 'hui-radio-circle' }, children: [{ type: 'div', props: { className: 'hui-radio-dot' } }] },
                { type: 'span', props: { className: 'hui-radio-label' }, children: ['Enterprise Plan'] }
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'div',
      props: { className: 'hui-card' },
      children: [
        { type: 'div', props: { className: 'hui-card-title' }, children: ['8. Combobox'] },
        {
          type: 'Combobox',
          props: { value: '{{ state.comboboxPerson }}', onChange: { action: 'setComboboxPerson' } },
          children: [
            {
              type: 'div',
              props: { className: 'hui-select-wrap' },
              children: [
                {
                  type: 'ComboboxInput',
                  props: {
                    className: 'hui-select-input',
                    displayValue: '{{ state.comboboxPerson }}',
                    placeholder: 'Search people...',
                    onChange: { action: 'onComboboxInputChange' }
                  }
                },
                {
                  type: 'ComboboxOptions',
                  props: { className: 'hui-select-options' },
                  children: [
                    { type: 'ComboboxOption', props: { value: 'Wade Cooper', className: 'hui-select-option' }, children: ['Wade Cooper'] },
                    { type: 'ComboboxOption', props: { value: 'Arlene Mccoy', className: 'hui-select-option' }, children: ['Arlene Mccoy'] },
                    { type: 'ComboboxOption', props: { value: 'Devon Webb', className: 'hui-select-option' }, children: ['Devon Webb'] }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

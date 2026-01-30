export const petFoodOrderSchema = {
  type: "default",
  id: "Form_ConditionalExample",
  schemaVersion: 16,
  components: [
    {
      type: "text",
      text: "# Pet Food Order\n\nSelect your pet type to see available food options.",
      id: "Field_intro",
    },
    {
      type: "select",
      key: "animal",
      label: "Animal Type",
      id: "Field_animal",
      values: [
        { label: "Cat", value: "Cat" },
        { label: "Fish", value: "Fish" },
        { label: "Dog", value: "Dog" },
      ],
      validate: {
        required: true,
      },
    },
    {
      type: "select",
      key: "catFood",
      label: "Cat Food",
      id: "Field_catFood",
      values: [
        { label: "Meat", value: "meat" },
        { label: "Grass", value: "grass" },
        { label: "Fish", value: "fish" },
      ],
      validate: {
        required: true,
      },
      conditional: {
        hide: "=animal != 'Cat'",
      },
    },
    {
      type: "select",
      key: "fishFood",
      label: "Fish Food",
      id: "Field_fishFood",
      values: [
        { label: "Insect", value: "insect" },
        { label: "Worms", value: "worms" },
      ],
      validate: {
        required: true,
      },
      conditional: {
        hide: "=animal != 'Fish'",
      },
    },
    {
      type: "select",
      key: "water",
      label: "Water Type",
      id: "Field_water",
      values: [
        { label: "Lake", value: "lake" },
        { label: "Sea", value: "sea" },
      ],
      validate: {
        required: true,
      },
      conditional: {
        hide: "=animal != 'Fish'",
      },
    },
    {
      type: "select",
      key: "dogFood",
      label: "Dog Food",
      id: "Field_dogFood",
      values: [
        { label: "Dry food", value: "dry" },
        { label: "Wet food", value: "wet" },
        { label: "Raw meat", value: "raw" },
      ],
      validate: {
        required: true,
      },
      conditional: {
        hide: "=animal != 'Dog'",
      },
    },
    {
      type: "checkbox",
      key: "needsWalking",
      label: "Needs daily walking",
      id: "Field_walking",
      conditional: {
        hide: "=animal != 'Dog'",
      },
    },
    {
      type: "number",
      key: "quantity",
      label: "Quantity (kg)",
      id: "Field_quantity",
      validate: {
        required: true,
        min: 1,
        max: 100,
      },
    },
    {
      type: "button",
      label: "Submit Order",
      id: "Field_submit",
      action: "submit",
    },
  ],
};

export const defaultSchema = {
  type: "default",
  id: "Form_1",
  components: [
    {
      type: "text",
      text: "# New Form\n\nStart editing your form by adding components.",
    },
    {
      key: "name",
      label: "Name",
      type: "textfield",
      validate: {
        required: true,
      },
    },
  ],
};

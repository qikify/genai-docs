# Tool Reference

The server exposes six tools. Each is a thin wrapper over the [REST API](/api/) — same validation, same credits, same results — so anything an agent does here is equivalent to the matching REST call.

## Workflow

1. [`list-templates`](#list-templates) / [`list-models`](#list-models) — discover what's available.
2. [`get-template`](#get-template) — see the inputs a template accepts.
3. [`generate-image`](#generate-image) — start a generation; returns a task id with status `created`.
4. [`get-task`](#get-task) — poll until status is `success` and read the image URLs. [`list-tasks`](#list-tasks) reviews earlier runs.

## `list-templates`

Lists the templates available to the account — its own plus public presets — each with its id, name, description, thumbnail, and model.

| Parameter | Type | Description |
|---|---|---|
| `s` | string | Search templates by name. |
| `ownership` | string | `all` (default), `public`, or `private`. |
| `model_id` | integer | Only templates using this model. |
| `per_page` | integer | Results per page (1–100, default 15). |
| `page` | integer | Page number. |

Returns a paginated list of templates. REST equivalent: [`GET /templates`](/api/templates).

## `get-template`

Full detail for one template, including the exact inputs it accepts: `default_inputs`, the model's `input` schema, and any `prompt_variables`. Call this before `generate-image`.

| Parameter | Type | Description |
|---|---|---|
| `template_id` | string · **required** | Template UUID (from `list-templates`). |

Returns the full template. REST equivalent: [`GET /templates/{template}`](/api/templates).

## `list-models`

Lists the available models and each model's `input` schema — the fields `generate-image` accepts when called with a `model_id`.

| Parameter | Type | Description |
|---|---|---|
| `s` | string | Search models by name. |
| `owner` | string | Filter by owner / provider slug (e.g. `openai`). |
| `sort_by` | string | `created_at` (default) or `name`. |
| `sort_direction` | string | `asc` or `desc` (default `desc`). |

Returns a paginated list of models. REST equivalent: [`GET /models`](/api/models).

## `generate-image`

Starts a generation from a template or a model. Asynchronous: returns a task id with status `created`. Poll [`get-task`](#get-task) for the result. Charges credits.

| Parameter | Type | Description |
|---|---|---|
| `template_id` | string | Template UUID to generate from. Provide this **or** `model_id`, not both. |
| `model_id` | integer | Model id to generate from directly, instead of a template. |
| `inputs` | object | Generation inputs the template/model accepts — e.g. `prompt`, `image_urls`, `image_size`. See `get-template` (`model.input`) for the accepted fields. |
| `variables` | object | Values for the template's prompt variables, as key → value. |
| `provider_id` | integer | Force a specific provider; omit to auto-select. |

Returns the created task. REST equivalent: [`POST /process`](/api/process).

## `get-task`

Status and result of one generation. While running, status is `created` or `processing`; when `success`, the response includes the output image URLs.

| Parameter | Type | Description |
|---|---|---|
| `task_id` | string · **required** | Task id from `generate-image`. |

Returns the task with its status and, when finished, output images. REST equivalent: [`GET /tasks/{task}`](/api/tasks).

## `list-tasks`

The account's generation tasks, most recent first, with status and model. Filter to review a batch — e.g. failed runs from one template.

| Parameter | Type | Description |
|---|---|---|
| `status` | string | `created`, `processing`, `success`, or `error`. |
| `template_id` | string | Only tasks from this template (UUID). |
| `model_id` | integer | Only tasks from this model id. |
| `per_page` | integer | Results per page (1–100, default 15). |
| `page` | integer | Page number. |

Returns a paginated list of tasks. REST equivalent: `GET /tasks`.

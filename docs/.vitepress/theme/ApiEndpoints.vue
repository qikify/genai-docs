<script setup lang="ts">
import spec from '../../public/openapi.json'
import { specTags } from '../spec-tags'

const tags = specTags(spec)
</script>

<template>
  <div v-for="tag in tags" :key="tag.slug">
    <h3 :id="tag.slug">{{ tag.name }}</h3>
    <ul>
      <li v-for="operation in tag.operations" :key="operation.operationId">
        <a :href="`/api/${operation.operationId}`"><code>{{ operation.method }} {{ operation.path }}</code></a>
        <template v-if="operation.summary"> — {{ operation.summary }}</template>
      </li>
    </ul>
  </div>
</template>

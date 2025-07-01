<template>
  <button @click="getPdf">Press here to get the PDF</button>
</template>

<script setup>
import api from '@/utils/axios'

const getPdf = async () => {
  try {
    const response = await api.get('/visit/pdf', {
      params: { id: 6 },
      responseType: 'blob', // Ensure response is treated as a binary file
    })
    // Create a URL for the blob and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'document.pdf') // Set the file name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link) // Clean up
  } catch (error) {
    console.error('Error fetching PDF:', error)
    // Handle error (e.g., show user feedback)
  }
}
</script>

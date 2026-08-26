import { notFound } from 'next/navigation'
import ProjectView from '@/components/ProjectView'
import { getProject, getProjects, nextProject } from '@/lib/catalog'

export function generateStaticParams() {
  return getProjects().map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const project = getProject(id)
  if (!project) return {}
  return {
    title: `${project.title} — Ishan`,
    description: project.blurb,
  }
}

export default async function ProjectPage({ params }) {
  const { id } = await params
  const project = getProject(id)
  if (!project) notFound()
  return <ProjectView project={project} next={nextProject(id)} />
}

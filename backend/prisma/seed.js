await prisma.role.createMany({
  data: [
    { name: "Admin" },
    { name: "Project Manager" },
    { name: "Collaborator" }
  ],
  skipDuplicates: true
});
export async function GET(request, { params }) {
  var members = {
    "LB004": {
      id: "LB004",
      name: "张三",
      role: "会员",
      joinDate: "2024-01-15",
      avatar: ""
    },
    "LB005": {
      id: "LB005",
      name: "李四",
      role: "VIP会员",
      joinDate: "2024-03-20",
      avatar: ""
    }
  };

  var member = members[params.id];

  if (!member) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(member);
}
resource "aws_ecs_service" "app" {
  name            = "app-service"
  cluster         = aws_ecs_cluster.main.id
  launch_type     = "FARGATE"
  desired_count   = 1
  task_definition = aws_ecs_task_definition.app.arn

  network_configuration {
    subnets         = [aws_subnet.public[0].id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }

#   load_balancer {
#     target_group_arn = aws_lb_target_group.app_tg.arn
#     container_name   = "vwanu-backend-api"
#     container_port   = 80
#   }

#   depends_on = [aws_lb_listener.app_listener]
}
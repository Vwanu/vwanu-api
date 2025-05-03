resource "aws_ecs_service" "app" {
  name            = "app-service-v2"
  cluster         = aws_ecs_cluster.main.id
  launch_type     = "FARGATE"
  desired_count   = 1
  task_definition = aws_ecs_task_definition.app.arn
  force_new_deployment = true

  network_configuration {
    subnets         = [aws_subnet.public[0].id, aws_subnet.public[1].id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app_tg_v2.arn
    container_name   = "vwanu-api-backend"
    container_port   = 4000
  }

  depends_on = [aws_lb_listener.http_listener]
  
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }
}
# resource "aws_lb" "app" {
#   name               = "app-lb"
#   internal           = false
#   load_balancer_type = "application"
#   subnets            = [aws_subnet.public[0].id, aws_subnet.public[1].id]
#   security_groups    = [aws_security_group.ecs_sg.id]
# }

# resource "aws_lb_target_group" "app_tg" {
#   name     = "app-target-group"
#   port     = 80
#   protocol = "HTTP"
#   vpc_id   = aws_vpc.main.id

#   health_check {
#     path                = "/"
#     protocol            = "HTTP"
#     interval            = 30
#     timeout             = 5
#     healthy_threshold   = 2
#     unhealthy_threshold = 2
#   }
# }

# resource "aws_lb_listener" "app_listener" {
#   load_balancer_arn = aws_lb.app.arn
#   port              = 80
#   protocol          = "HTTP"

#   default_action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.app_tg.arn
#   }
# }
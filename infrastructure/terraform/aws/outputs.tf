# Outputs for AWS Infrastructure

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "ID of the public subnet"
  value       = aws_subnet.public.id
}

output "web_security_group_id" {
  description = "ID of the web security group"
  value       = aws_security_group.web.id
}

output "web_instance_ids" {
  description = "IDs of the web instances"
  value       = aws_instance.web[*].id
}

output "web_instance_public_ips" {
  description = "Public IPs of the web instances"
  value       = aws_instance.web[*].public_ip
}

output "web_instance_public_dns" {
  description = "Public DNS names of the web instances"
  value       = aws_instance.web[*].public_dns
} 